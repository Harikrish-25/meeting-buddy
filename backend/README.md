# Meeting Buddy Backend

FastAPI backend for the Meeting Buddy application.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Database Setup**
   - Install PostgreSQL
   - Create database: `CREATE DATABASE meeting_buddy;`
   - Update `.env` file with your database credentials

3. **Environment Variables**
   Copy `.env.example` to `.env` and update:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/meeting_buddy
   SECRET_KEY=your-secret-key-here
   ```

4. **Run the Application**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user

### Hubs
- `POST /hubs` - Create new hub
- `GET /hubs` - Get user's hubs
- `GET /hubs/{hub_id}` - Get specific hub

### Teams
- `POST /hubs/{hub_id}/teams` - Create team in hub

### Messages
- `POST /channels/{channel_id}/messages` - Send message
- `GET /channels/{channel_id}/messages` - Get channel messages

### Meetings
- `POST /hubs/{hub_id}/meetings` - Create meeting
- `GET /hubs/{hub_id}/meetings` - Get hub meetings

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

### Users
- id (UUID)
- email
- hashed_password
- name
- avatar
- is_active
- created_at

### Hubs
- id (UUID)
- name
- type
- creator_id
- created_at

### Teams
- id (UUID)
- name
- department
- hub_id
- leader_id
- assistant_id
- channel_id

### Channels
- id (UUID)
- name
- type (all-members/team)
- hub_id
- team_id

### Messages
- id (UUID)
- content
- channel_id
- sender_id
- created_at

### Meetings
- id (UUID)
- title
- agenda
- scheduled_at
- duration
- jitsi_link
- hub_id
- creator_id