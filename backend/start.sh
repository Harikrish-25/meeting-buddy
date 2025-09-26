#!/bin/bash

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set up PostgreSQL database
echo "Setting up PostgreSQL database..."
echo "Please ensure PostgreSQL is installed and running"
echo "Create database: CREATE DATABASE meeting_buddy;"

# Run database migrations (if using Alembic)
# alembic upgrade head

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000