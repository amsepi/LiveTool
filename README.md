# YouTube to MP3 Web App

A modern, fullstack web app to download YouTube videos as MP3 files. Built with FastAPI (Python), React (Vite), Tailwind CSS, and Docker. Features real-time download progress and beautiful, responsive UI.

---

## Features
- Paste any YouTube URL and download the audio as an MP3
- Real-time progress bar with download/conversion status
- Video title used as the MP3 filename
- Beautiful, mobile-friendly UI (React + Tailwind)
- All-in-one Docker image for easy deployment

---

## Quick Start (Docker)

### 1. Build the Docker image
```sh
docker build -t amsepi42/youtube-to-mp3:latest .
```

### 2. Run the container
```sh
docker run -p 8000:8000 amsepi42/youtube-to-mp3:latest
```

- The app will be available at: http://localhost:8000
- Paste a YouTube URL and download the MP3 with real-time progress!

### 3. (Optional) Pull from Docker Hub
If the image is available on Docker Hub:
```sh
docker pull amsepi42/youtube-to-mp3:latest
docker run -p 8000:8000 amsepi42/youtube-to-mp3:latest
```

---

## Local Development

### Backend (FastAPI)
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)
```sh
cd frontend
npm install
npm run dev
```

---

## Project Structure
```
backend/    # FastAPI app (API, static serving, yt-dlp)
frontend/   # React app (Vite, Tailwind CSS)
Dockerfile  # Multi-stage build for fullstack deployment
```

---

## Credits
- Made by Ahmed Hammad ([amsepi](https://github.com/amsepi))

---

## License
MIT