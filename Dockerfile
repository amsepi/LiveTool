# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + static serving
FROM python:3.11-slim AS backend
WORKDIR /app
# Install ffmpeg for yt-dlp audio extraction
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
# Copy backend code
COPY backend/ ./backend/
# Copy frontend build to backend static directory
COPY --from=frontend-build /app/frontend/dist ./backend/static
# Expose port
EXPOSE 8000
# Set environment variables
ENV PYTHONUNBUFFERED=1
# Run FastAPI app with Uvicorn, serve static files from /backend/static
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]