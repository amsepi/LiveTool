from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse, Response
import yt_dlp
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import threading
import time
from typing import Dict

app = FastAPI()

# Serve static files (frontend build) at /static
frontend_path = os.path.join(os.path.dirname(__file__), 'static')
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path, html=True), name="static")

# Allow all origins for development; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory progress store: {download_id: {progress, status, title}}
progress_store: Dict[str, Dict] = {}

@app.get("/")
def read_root():
    index_file = os.path.join(frontend_path, 'index.html')
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "YouTube to MP3 API is running."}

@app.get("/progress")
def progress_stream(download_id: str):
    def event_stream():
        last_progress = None
        while True:
            prog = progress_store.get(download_id)
            if prog is None:
                time.sleep(0.2)
                continue
            if prog != last_progress:
                yield f"data: {prog}\n\n"
                last_progress = prog.copy()
            if prog.get("status") in ("finished", "error"):
                break
            time.sleep(0.2)
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/download")
def download_audio(url: str = Query(..., description="YouTube video URL"), download_id: str = Query(..., description="Download ID")):
    # Generate a unique filename
    output_dir = "/tmp"
    unique_id = str(uuid.uuid4())
    output_template = os.path.join(output_dir, f"{unique_id}.%(ext)s")
    progress_store[download_id] = {"progress": 0, "status": "starting", "title": None}
    def progress_hook(d):
        if d['status'] == 'downloading':
            percent = d.get('downloaded_bytes', 0) / max(d.get('total_bytes', 1), 1) * 100 if d.get('total_bytes') else 0
            progress_store[download_id] = {
                "progress": percent,
                "status": "downloading",
                "title": d.get('info_dict', {}).get('title') or progress_store[download_id].get('title')
            }
        elif d['status'] == 'finished':
            progress_store[download_id] = {
                "progress": 100,
                "status": "converting",
                "title": d.get('info_dict', {}).get('title') or progress_store[download_id].get('title')
            }
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'progress_hooks': [progress_hook],
        'quiet': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            mp3_path = output_template.replace('%(ext)s', 'mp3')
            if not os.path.exists(mp3_path):
                progress_store[download_id] = {"progress": 100, "status": "error", "title": None}
                raise HTTPException(status_code=500, detail="MP3 file not found after download.")
            progress_store[download_id] = {"progress": 100, "status": "finished", "title": info.get('title', 'audio')}
    except Exception as e:
        progress_store[download_id] = {"progress": 100, "status": "error", "title": None}
        raise HTTPException(status_code=400, detail=f"Download failed: {str(e)}")
    safe_title = info.get('title', 'audio').replace('"', '').replace("'", '').replace('/', '_').replace('\\', '_')
    filename = f"{safe_title}.mp3"
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
    return FileResponse(mp3_path, media_type="audio/mpeg", filename=filename, headers=headers)