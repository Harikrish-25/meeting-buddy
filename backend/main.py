from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime, timedelta
import uuid

from database import get_db, engine
from models import *
from schemas import *
from auth import get_password_hash, verify_password, create_access_token, get_current_user, authenticate_user
import os
from dotenv import load_dotenv

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Buddy API", version="1.0.0", description="Backend for Meeting Buddy Application")

# CORS middleware
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Meeting Buddy API", "status": "running"}

# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        avatar=f"https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate access token
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# User endpoints
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Hub endpoints
@app.post("/hubs", response_model=Hub)
async def create_hub(hub: HubCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Create hub
    db_hub = Hub(
        name=hub.name,
        type=hub.type,
        creator_id=current_user.id
    )
    
    db.add(db_hub)
    db.commit()
    db.refresh(db_hub)
    
    # Add creator as member
    creator_member = db.query(User).filter(User.email == hub.creator).first()
    if creator_member:
        # Add creator to hub_members table with appropriate role
        db.execute(
            hub_members.insert().values(
                hub_id=db_hub.id,
                user_id=creator_member.id,
                role=UserRole.CEO  # Default creator role
            )
        )
    
    # Add other members
    for member_data in hub.members:
        member_user = db.query(User).filter(User.email == member_data.email).first()
        if member_user:
            db.execute(
                hub_members.insert().values(
                    hub_id=db_hub.id,
                    user_id=member_user.id,
                    role=member_data.role
                )
            )
    
    # Create default "All Members" channel
    all_members_channel = Channel(
        name="All Members",
        type=ChannelType.ALL_MEMBERS,
        hub_id=db_hub.id
    )
    db.add(all_members_channel)
    
    db.commit()
    
    # Return hub with members
    return get_hub_response(db_hub, db)

@app.get("/hubs", response_model=List[Hub])
async def get_user_hubs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get hubs where user is a member
    hubs = db.query(Hub).join(hub_members).filter(hub_members.c.user_id == current_user.id).all()
    
    return [get_hub_response(hub, db) for hub in hubs]

@app.get("/hubs/{hub_id}", response_model=Hub)
async def get_hub(hub_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is member of the hub
    hub = db.query(Hub).join(hub_members).filter(
        Hub.id == hub_id,
        hub_members.c.user_id == current_user.id
    ).first()
    
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    
    return get_hub_response(hub, db)

# Team endpoints
@app.post("/hubs/{hub_id}/teams", response_model=Team)
async def create_team(
    hub_id: str, 
    team: TeamCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Verify user is member of hub
    hub_member = db.query(hub_members).filter(
        hub_members.c.hub_id == hub_id,
        hub_members.c.user_id == current_user.id
    ).first()
    
    if not hub_member:
        raise HTTPException(status_code=403, detail="Not authorized to create teams in this hub")
    
    # Create team
    db_team = Team(
        name=team.name,
        description=team.description,
        department=team.department,
        hub_id=hub_id,
        leader_id=team.leader,
        assistant_id=team.assistant
    )
    
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # Add team members
    for member_id in team.members:
        db.execute(
            team_members.insert().values(
                team_id=db_team.id,
                user_id=member_id
            )
        )
    
    # Create team channel
    team_channel = Channel(
        name=team.name,
        type=ChannelType.TEAM,
        hub_id=hub_id,
        team_id=db_team.id
    )
    db.add(team_channel)
    db.commit()
    db.refresh(team_channel)
    
    # Update team with channel_id
    db_team.channel_id = team_channel.id
    db.commit()
    
    return get_team_response(db_team, db)

# Message endpoints
@app.post("/channels/{channel_id}/messages", response_model=Message)
async def send_message(
    channel_id: str,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user has access to channel
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Check if user is member of the hub
    hub_member = db.query(hub_members).filter(
        hub_members.c.hub_id == channel.hub_id,
        hub_members.c.user_id == current_user.id
    ).first()
    
    if not hub_member:
        raise HTTPException(status_code=403, detail="Not authorized to send messages in this channel")
    
    # Create message
    db_message = Message(
        content=message.content,
        channel_id=channel_id,
        sender_id=current_user.id
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return get_message_response(db_message, db)

@app.get("/channels/{channel_id}/messages", response_model=List[Message])
async def get_messages(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify access
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    hub_member = db.query(hub_members).filter(
        hub_members.c.hub_id == channel.hub_id,
        hub_members.c.user_id == current_user.id
    ).first()
    
    if not hub_member:
        raise HTTPException(status_code=403, detail="Not authorized to access this channel")
    
    messages = db.query(Message).filter(Message.channel_id == channel_id).order_by(Message.created_at).all()
    
    return [get_message_response(msg, db) for msg in messages]

# Meeting endpoints
@app.post("/hubs/{hub_id}/meetings", response_model=Meeting)
async def create_meeting(
    hub_id: str,
    meeting: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create meeting
    db_meeting = Meeting(
        title=meeting.title,
        agenda=json.dumps(meeting.agenda),
        scheduled_at=meeting.scheduledFor,
        duration=meeting.duration,
        jitsi_link=f"https://meet.jit.si/AIMeetingBuddy{str(uuid.uuid4())[:8]}",
        hub_id=hub_id,
        creator_id=current_user.id
    )
    
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Add participants
    for participant_id in meeting.participants:
        db.execute(
            meeting_participants.insert().values(
                meeting_id=db_meeting.id,
                user_id=participant_id
            )
        )
    
    db.commit()
    
    return get_meeting_response(db_meeting, db)

@app.get("/hubs/{hub_id}/meetings", response_model=List[Meeting])
async def get_hub_meetings(
    hub_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meetings = db.query(Meeting).filter(Meeting.hub_id == hub_id).all()
    return [get_meeting_response(meeting, db) for meeting in meetings]

# Helper functions
def get_hub_response(hub: Hub, db: Session):
    # Get members with roles
    members_query = db.query(User, hub_members.c.role, hub_members.c.joined_at).join(
        hub_members, User.id == hub_members.c.user_id
    ).filter(hub_members.c.hub_id == hub.id)
    
    members = []
    for user, role, joined_at in members_query:
        members.append({
            "userId": user.id,
            "name": user.name,
            "email": user.email,
            "role": role,
            "joinedAt": joined_at,
            "avatar": user.avatar
        })
    
    # Get teams
    teams = []
    for team in hub.teams:
        teams.append(get_team_response(team, db))
    
    # Get channels
    channels = []
    for channel in hub.channels:
        messages = [get_message_response(msg, db) for msg in channel.messages]
        channels.append({
            "id": channel.id,
            "name": channel.name,
            "type": channel.type,
            "teamId": channel.team_id,
            "messages": messages
        })
    
    return {
        "id": hub.id,
        "name": hub.name,
        "type": hub.type,
        "creator": hub.creator.email,
        "createdAt": hub.created_at,
        "members": members,
        "teams": teams,
        "channels": channels
    }

def get_team_response(team: Team, db: Session):
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "department": team.department,
        "leader": team.leader_id,
        "assistant": team.assistant_id,
        "members": [member.id for member in team.members],
        "channelId": team.channel_id
    }

def get_message_response(message: Message, db: Session):
    return {
        "id": message.id,
        "userId": message.sender_id,
        "userName": message.sender.name,
        "content": message.content,
        "timestamp": message.created_at,
        "avatar": message.sender.avatar
    }

def get_meeting_response(meeting: Meeting, db: Session):
    return {
        "id": meeting.id,
        "title": meeting.title,
        "hubId": meeting.hub_id,
        "agenda": json.loads(meeting.agenda) if meeting.agenda else [],
        "participants": [participant.id for participant in meeting.participants],
        "createdBy": meeting.creator_id,
        "scheduledFor": meeting.scheduled_at,
        "duration": meeting.duration,
        "jitsiLink": meeting.jitsi_link,
        "status": meeting.status,
        "joinLogs": [],
        "summary": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)