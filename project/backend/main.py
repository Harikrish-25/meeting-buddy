from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid
from enum import Enum

app = FastAPI(title="AI Meeting Buddy API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

# In-memory storage (replace with database in production)
users_db = {}
hubs_db = {}
meetings_db = {}
chatbot_history_db = {}

# Enums
class UserRole(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    HR = "HR"
    MEMBER = "Member"

class HubType(str, Enum):
    CORPORATE = "corporate"
    STARTUP = "startup"
    NONPROFIT = "nonprofit"
    TEAM = "team"

class MeetingStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class HubMember(BaseModel):
    user_id: str
    name: str
    email: str
    role: UserRole
    joined_at: datetime
    avatar: Optional[str] = None

class Team(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    members: List[str]
    channel_id: str

class Channel(BaseModel):
    id: str
    name: str
    type: str
    team_id: Optional[str] = None
    messages: List[dict] = []

class HubCreate(BaseModel):
    name: str
    type: HubType
    description: Optional[str] = None
    teams: List[dict] = []
    members: List[dict] = []

class Hub(BaseModel):
    id: str
    name: str
    type: HubType
    creator: str
    created_at: datetime
    members: List[HubMember]
    teams: List[Team]
    channels: List[Channel]

class MeetingCreate(BaseModel):
    title: str
    hub_id: str
    agenda: List[str]
    participants: List[str]
    scheduled_for: datetime
    duration: int

class Meeting(BaseModel):
    id: str
    title: str
    hub_id: str
    agenda: List[str]
    participants: List[str]
    created_by: str
    scheduled_for: datetime
    duration: int
    jitsi_link: str
    status: MeetingStatus
    join_logs: List[dict] = []
    summary: Optional[str] = None

class ChatbotQuery(BaseModel):
    hub_id: str
    query: str
    type: str = "team_question"

class ChatbotHistory(BaseModel):
    id: str
    hub_id: str
    type: str
    title: str
    query: str
    response: str
    timestamp: datetime
    meeting_id: Optional[str] = None

# Utility functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(user_id: str = Depends(verify_token)):
    user = users_db.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Initialize demo data
def init_demo_data():
    # Create demo users
    demo_users = [
        {"id": "1", "email": "admin@company.com", "password": "admin123", "name": "Admin User", "avatar": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"},
        {"id": "2", "email": "manager@company.com", "password": "manager123", "name": "Sarah Manager", "avatar": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"},
        {"id": "3", "email": "john@company.com", "password": "john123", "name": "John Doe", "avatar": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"}
    ]
    
    for user in demo_users:
        user_copy = user.copy()
        user_copy['password'] = hash_password(user_copy['password'])
        users_db[user['id']] = user_copy

# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    for user in users_db.values():
        if user['email'] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user = {
        'id': user_id,
        'email': user_data.email,
        'password': hashed_password,
        'name': user_data.name,
        'avatar': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
    
    users_db[user_id] = user
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            avatar=user.get('avatar')
        )
    }

@app.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    # Find user
    user = None
    for u in users_db.values():
        if u['email'] == login_data.email:
            user = u
            break
    
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": user['id']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            avatar=user.get('avatar')
        )
    }

# Hub endpoints
@app.post("/hubs/create", response_model=Hub)
async def create_hub(hub_data: HubCreate, current_user = Depends(get_current_user)):
    hub_id = str(uuid.uuid4())
    
    # Create hub members
    members = []
    # Add creator as admin
    members.append(HubMember(
        user_id=current_user['id'],
        name=current_user['name'],
        email=current_user['email'],
        role=UserRole.ADMIN,
        joined_at=datetime.now(),
        avatar=current_user.get('avatar')
    ))
    
    # Add other members
    for member_data in hub_data.members:
        if member_data.get('name') and member_data.get('email'):
            members.append(HubMember(
                user_id=str(uuid.uuid4()),
                name=member_data['name'],
                email=member_data['email'],
                role=member_data.get('role', UserRole.MEMBER),
                joined_at=datetime.now(),
                avatar='https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
            ))
    
    # Create teams
    teams = []
    channels = []
    
    # Add all-members channel
    channels.append(Channel(
        id='channel_all_members',
        name='All Members',
        type='all-members',
        messages=[{
            'id': str(uuid.uuid4()),
            'user_id': current_user['id'],
            'user_name': current_user['name'],
            'content': f'Welcome to {hub_data.name}! Looking forward to working with everyone.',
            'timestamp': datetime.now().isoformat(),
            'avatar': current_user.get('avatar')
        }]
    ))
    
    # Add team channels
    for team_data in hub_data.teams:
        if team_data.get('name'):
            team_id = str(uuid.uuid4())
            channel_id = f'channel_team_{team_id}'
            
            teams.append(Team(
                id=team_id,
                name=team_data['name'],
                description=team_data.get('description', ''),
                members=[],
                channel_id=channel_id
            ))
            
            channels.append(Channel(
                id=channel_id,
                name=team_data['name'],
                type='team',
                team_id=team_id,
                messages=[]
            ))
    
    hub = Hub(
        id=hub_id,
        name=hub_data.name,
        type=hub_data.type,
        creator=current_user['id'],
        created_at=datetime.now(),
        members=members,
        teams=teams,
        channels=channels
    )
    
    hubs_db[hub_id] = hub.dict()
    return hub

@app.get("/hubs/{hub_id}", response_model=Hub)
async def get_hub(hub_id: str, current_user = Depends(get_current_user)):
    hub = hubs_db.get(hub_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    # Check if user is a member
    is_member = any(member['user_id'] == current_user['id'] for member in hub['members'])
    if not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Hub(**hub)

@app.get("/hubs", response_model=List[Hub])
async def get_user_hubs(current_user = Depends(get_current_user)):
    user_hubs = []
    for hub in hubs_db.values():
        is_member = any(member['user_id'] == current_user['id'] for member in hub['members'])
        if is_member:
            user_hubs.append(Hub(**hub))
    return user_hubs

# Meeting endpoints
@app.post("/meetings/create", response_model=Meeting)
async def create_meeting(meeting_data: MeetingCreate, current_user = Depends(get_current_user)):
    # Check if user has permission to create meetings
    hub = hubs_db.get(meeting_data.hub_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    user_member = next((m for m in hub['members'] if m['user_id'] == current_user['id']), None)
    if not user_member or user_member['role'] not in ['Admin', 'Manager', 'HR']:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    meeting_id = str(uuid.uuid4())
    jitsi_link = f"https://meet.jit.si/AIMeetingBuddy{meeting_id}"
    
    meeting = Meeting(
        id=meeting_id,
        title=meeting_data.title,
        hub_id=meeting_data.hub_id,
        agenda=meeting_data.agenda,
        participants=meeting_data.participants,
        created_by=current_user['id'],
        scheduled_for=meeting_data.scheduled_for,
        duration=meeting_data.duration,
        jitsi_link=jitsi_link,
        status=MeetingStatus.SCHEDULED,
        join_logs=[]
    )
    
    meetings_db[meeting_id] = meeting.dict()
    return meeting

@app.get("/meetings/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: str, current_user = Depends(get_current_user)):
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if user is a participant
    if current_user['id'] not in meeting['participants']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Meeting(**meeting)

@app.get("/meetings", response_model=List[Meeting])
async def get_hub_meetings(hub_id: str, current_user = Depends(get_current_user)):
    # Check if user is a member of the hub
    hub = hubs_db.get(hub_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    is_member = any(member['user_id'] == current_user['id'] for member in hub['members'])
    if not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    hub_meetings = [Meeting(**meeting) for meeting in meetings_db.values() if meeting['hub_id'] == hub_id]
    return hub_meetings

@app.post("/meetings/{meeting_id}/join")
async def join_meeting(meeting_id: str, current_user = Depends(get_current_user)):
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if current_user['id'] not in meeting['participants']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Add join log
    join_log = {
        'user_id': current_user['id'],
        'user_name': current_user['name'],
        'action': 'join',
        'timestamp': datetime.now().isoformat()
    }
    
    meeting['join_logs'].append(join_log)
    meeting['status'] = 'active'
    meetings_db[meeting_id] = meeting
    
    return {"message": "Joined meeting successfully", "jitsi_link": meeting['jitsi_link']}

@app.post("/meetings/{meeting_id}/leave")
async def leave_meeting(meeting_id: str, current_user = Depends(get_current_user)):
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Add leave log
    leave_log = {
        'user_id': current_user['id'],
        'user_name': current_user['name'],
        'action': 'leave',
        'timestamp': datetime.now().isoformat()
    }
    
    meeting['join_logs'].append(leave_log)
    meetings_db[meeting_id] = meeting
    
    return {"message": "Left meeting successfully"}

# Chatbot endpoints
@app.post("/bot/query", response_model=ChatbotHistory)
async def chatbot_query(query_data: ChatbotQuery, current_user = Depends(get_current_user)):
    # Check if user has access to the hub
    hub = hubs_db.get(query_data.hub_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    is_member = any(member['user_id'] == current_user['id'] for member in hub['members'])
    if not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate mock AI response
    response = generate_ai_response(query_data.query)
    
    chat_entry = ChatbotHistory(
        id=str(uuid.uuid4()),
        hub_id=query_data.hub_id,
        type=query_data.type,
        title=query_data.query[:50] + "..." if len(query_data.query) > 50 else query_data.query,
        query=query_data.query,
        response=response,
        timestamp=datetime.now()
    )
    
    chatbot_history_db[chat_entry.id] = chat_entry.dict()
    return chat_entry

@app.post("/bot/summarize")
async def summarize_meeting(meeting_id: str, current_user = Depends(get_current_user)):
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if current_user['id'] not in meeting['participants']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate summary
    summary = f"Meeting '{meeting['title']}' was successfully completed. Key highlights include discussion of the agenda items and active participation from all attendees."
    
    meeting['summary'] = summary
    meeting['status'] = 'completed'
    meetings_db[meeting_id] = meeting
    
    # Create chatbot history entry
    chat_entry = ChatbotHistory(
        id=str(uuid.uuid4()),
        hub_id=meeting['hub_id'],
        type='meeting_summary',
        title=f"{meeting['title']} Summary",
        query=f"Summarize the {meeting['title']} meeting",
        response=summary,
        timestamp=datetime.now(),
        meeting_id=meeting_id
    )
    
    chatbot_history_db[chat_entry.id] = chat_entry.dict()
    
    return {"summary": summary}

@app.get("/bot/history/{hub_id}", response_model=List[ChatbotHistory])
async def get_chatbot_history(hub_id: str, current_user = Depends(get_current_user)):
    # Check if user has access to the hub
    hub = hubs_db.get(hub_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    is_member = any(member['user_id'] == current_user['id'] for member in hub['members'])
    if not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    hub_history = [ChatbotHistory(**entry) for entry in chatbot_history_db.values() if entry['hub_id'] == hub_id]
    return sorted(hub_history, key=lambda x: x.timestamp, reverse=True)

def generate_ai_response(query: str) -> str:
    """Generate a mock AI response based on the query"""
    responses = [
        f"Based on your team's recent activity and communication patterns, here's what I found regarding '{query}':\n\n• Your team has shown strong collaboration in recent discussions\n• Key stakeholders are actively engaged in project initiatives\n• Communication flow is efficient across all channels\n\nWould you like me to provide more specific insights or recommendations?",
        f"I've analyzed the relevant information for '{query}' and here are my recommendations:\n\n• Consider scheduling regular check-ins to maintain momentum\n• Documentation of key decisions should be prioritized\n• Team members seem well-aligned on current objectives\n\nThis approach should help optimize your team's performance and collaboration.",
        f"Regarding '{query}', I've identified several important points:\n\n• Current team dynamics are positive and productive\n• Resource allocation appears to be well-balanced\n• Communication channels are being utilized effectively\n\nI recommend continuing with the current strategy while monitoring for any emerging challenges."
    ]
    
    import random
    return random.choice(responses)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Initialize demo data on startup
@app.on_event("startup")
async def startup_event():
    init_demo_data()
    print("AI Meeting Buddy API started with demo data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)