# LiveTool -> A Multi-Tool Web App

A modern, fullstack web app with two powerful features: YouTube to MP3 conversion and AI-powered background removal. Built with FastAPI (Python), React (Vite), Tailwind CSS, and Docker. Features real-time progress tracking and beautiful, responsive UI.

---

## Features

### 🎵 YouTube to MP3
- Paste any YouTube URL and download the audio as an MP3
- Real-time progress bar with download/conversion status
- Video title used as the MP3 filename
- Enhanced anti-detection measures for reliable downloads

### 🖼️ Background Removal
- Upload any image and remove the background instantly
- Powered by lightweight neural network (rembg)
- Supports PNG, JPG, JPEG formats
- Preview functionality before processing
- High-quality output with transparent background

### 🎨 Modern UI
- Beautiful, mobile-friendly interface (React + Tailwind)
- Feature selection menu
- Glassmorphism design with animated backgrounds
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
- Choose between YouTube to MP3 or Background Removal features!

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
backend/    # FastAPI app (API, static serving, yt-dlp, rembg)
frontend/   # React app (Vite, Tailwind CSS)
Dockerfile  # Multi-stage build for fullstack deployment
```

---

## API Endpoints

- `GET /` - Serve the frontend application
- `GET /download` - Download YouTube video as MP3
- `POST /remove-bg` - Remove background from uploaded image
- `GET /progress` - Real-time progress updates (SSE)

---

## Credits
- Made by Ahmed Hammad ([amsepi](https://github.com/amsepi))

---

## License
MIT
