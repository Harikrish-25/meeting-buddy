@echo off

echo Installing Python dependencies...
pip install -r requirements.txt

echo Setting up PostgreSQL database...
echo Please ensure PostgreSQL is installed and running
echo Create database: CREATE DATABASE meeting_buddy;

echo Starting FastAPI server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000