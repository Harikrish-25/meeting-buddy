# Backend Setup Instructions

## Prerequisites

1. **Python 3.8+** - Install from [python.org](https://www.python.org/)
2. **PostgreSQL** - Install from [postgresql.org](https://www.postgresql.org/)

## Quick Setup

1. **Navigate to backend folder**
   ```bash
   cd D:\Gmeet\backend
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup PostgreSQL Database**
   ```sql
   -- Connect to PostgreSQL as superuser
   CREATE DATABASE meeting_buddy;
   CREATE USER meeting_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE meeting_buddy TO meeting_user;
   ```

5. **Update environment variables**
   - Copy `.env` file and update database credentials
   - Update `SECRET_KEY` for production

6. **Start the backend server**
   ```bash
   python main.py
   ```
   
   Or use uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Environment Variables

Add to your frontend `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

## API Testing

Visit http://localhost:8000/docs for interactive API documentation.

## Full Stack Connection

1. Start backend server (port 8000)
2. Start frontend server (port 5173)
3. Frontend will automatically connect to backend API
4. Authentication and data will be stored in PostgreSQL

Your full-stack application is now ready!