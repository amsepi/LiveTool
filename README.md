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

## AWS Deployment with Terraform

This project includes a Terraform configuration to automatically deploy the application to AWS.

### What is Terraform?

Terraform is an **Infrastructure as Code (IaC)** tool. Instead of manually clicking through the AWS console to create servers, networks, and security groups, you define all those resources in configuration files. This makes your infrastructure repeatable, version-controlled, and easy to manage.

### How to Deploy

Anyone who clones this repository can easily replicate the deployment by following these steps:

#### 1. Prerequisites

Before you begin, you need:

*   An AWS Account.
*   Terraform CLI installed on your local machine.
*   AWS CLI installed and configured (`aws configure`) with credentials for an IAM User.
*   An EC2 Key Pair created in your target AWS region. This is for SSH access.
*   The correct IAM Permissions for your user. The `AdministratorAccess` policy works but is not recommended for production. A custom policy is safer.

#### 2. Customize Variables

Inside the `livetool-deployment` directory, open `variables.tf`. If your AWS region or EC2 Key Pair name are different, you can change the `default` values in this file.

#### 3. Run Terraform

Navigate to the deployment directory and run the standard Terraform commands:

```sh
cd livetool-deployment

# Initializes Terraform and downloads the AWS provider
terraform init

# Provisions all the resources defined in the .tf files
terraform apply
```

After confirming with `yes`, Terraform will build the infrastructure. When it's done, it will output the public IP address of the server.

#### 4. Access the Application

Wait 5-10 minutes for the setup script to finish, then open your browser to `http://<public_ip>:8000`.

#### 5. Clean Up

To avoid ongoing AWS charges, you can destroy all the created infrastructure with a single command:

```sh
terraform destroy
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