# Marvel Movie Bot

A chatbot that lets you chat with Marvel characters about MCU movies using AI.

## Quick Setup

### 1. Backend API Setup

```bash
# Navigate to API directory
cd api

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the frontend dev server
npm run dev
```

### 3. Environment Variables

Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

## Using ngrok for External Access

### Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via homebrew
brew install ngrok
```

### Expose API
```bash
# Expose the API server
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Update Frontend Environment
Update `frontend/.env`:
```env
VITE_API_URL=https://abc123.ngrok.io
```

### Restart Frontend
```bash
# Stop frontend (Ctrl+C) and restart
npm run dev
```

## Development Commands

### Backend
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database/Data
```bash
# Run data ingestion
python ingestion.py

# Test the API
python test.py
```

## Project Structure

```
marvel-movie-bot/
├── api/                 # FastAPI backend
│   ├── main.py         # API endpoints
│   ├── requirements.txt # Python dependencies
│   └── system_prompt.txt
├── frontend/           # React frontend
│   ├── src/
│   ├── package.json
│   └── index.html
├── dataset/           # Marvel movie data
│   ├── movies.csv
│   ├── characters.csv
│   └── script_txts/
├── ingestion.py       # Data processing
└── test.py           # API testing
```

## Troubleshooting

### Port Issues
- API: Change port in uvicorn command
- Frontend: Change port in vite.config.js

### CORS Issues
- Make sure API is running on correct host/port
- Check VITE_API_URL in frontend .env

### ngrok Issues
- Use `ngrok http 8000 --host-header=localhost:8000` if needed
- Check ngrok dashboard for connection status

## Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Railway/Render (Backend)
```bash
# Deploy api/ directory
# Set environment variables
```

## Notes
- API runs on port 8000 by default
- Frontend runs on port 5173 by default
- ngrok provides HTTPS tunnel for external access
- Remember to update VITE_API_URL when using ngrok