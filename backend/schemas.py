from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import UserRole, HubType, ChannelType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Hub Member Schema
class HubMemberCreate(BaseModel):
    email: EmailStr
    role: UserRole

class HubMember(BaseModel):
    userId: str
    name: str
    email: EmailStr
    role: UserRole
    joinedAt: datetime
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

# Hub Schemas
class HubCreate(BaseModel):
    name: str
    type: HubType
    creator: str  # email
    members: List[HubMemberCreate] = []

class Hub(BaseModel):
    id: str
    name: str
    type: HubType
    creator: str
    createdAt: datetime
    members: List[HubMember] = []
    teams: List[Dict[str, Any]] = []
    channels: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    department: str
    leader: str  # user_id
    assistant: str  # user_id
    members: List[str] = []  # user_ids

class Team(BaseModel):
    id: str
    name: str
    description: Optional[str]
    department: str
    leader: str
    assistant: str
    members: List[str] = []
    channelId: str
    
    class Config:
        from_attributes = True

# Channel Schemas
class Channel(BaseModel):
    id: str
    name: str
    type: ChannelType
    teamId: Optional[str] = None
    messages: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True

# Message Schemas
class MessageCreate(BaseModel):
    content: str
    channelId: str

class Message(BaseModel):
    id: str
    userId: str
    userName: str
    content: str
    timestamp: datetime
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

# Meeting Schemas
class MeetingCreate(BaseModel):
    title: str
    agenda: List[str] = []
    participants: List[str] = []  # user_ids
    scheduledFor: datetime
    duration: int

class Meeting(BaseModel):
    id: str
    title: str
    hubId: str
    agenda: List[str] = []
    participants: List[str] = []
    createdBy: str
    scheduledFor: datetime
    duration: int
    jitsiLink: str
    status: str
    joinLogs: List[Dict[str, Any]] = []
    summary: Optional[str] = None
    
    class Config:
        from_attributes = True