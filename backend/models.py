from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid

Base = declarative_base()

class UserRole(str, enum.Enum):
    CEO = "CEO"
    MANAGER = "Manager"
    HR = "HR"
    EMPLOYEE = "Employee"

class HubType(str, enum.Enum):
    CORPORATE = "corporate"
    STARTUP = "startup"
    NONPROFIT = "nonprofit"
    TEAM = "team"

class ChannelType(str, enum.Enum):
    ALL_MEMBERS = "all-members"
    TEAM = "team"

# Association tables
hub_members = Table(
    'hub_members',
    Base.metadata,
    Column('hub_id', String, ForeignKey('hubs.id'), primary_key=True),
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('role', SQLEnum(UserRole), nullable=False),
    Column('joined_at', DateTime(timezone=True), server_default=func.now())
)

team_members = Table(
    'team_members',
    Base.metadata,
    Column('team_id', String, ForeignKey('teams.id'), primary_key=True),
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('joined_at', DateTime(timezone=True), server_default=func.now())
)

meeting_participants = Table(
    'meeting_participants',
    Base.metadata,
    Column('meeting_id', String, ForeignKey('meetings.id'), primary_key=True),
    Column('user_id', String, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_hubs = relationship("Hub", back_populates="creator")
    messages = relationship("Message", back_populates="sender")
    created_meetings = relationship("Meeting", back_populates="creator")
    led_teams = relationship("Team", foreign_keys="Team.leader_id", back_populates="leader")
    assisted_teams = relationship("Team", foreign_keys="Team.assistant_id", back_populates="assistant")
    
    # Many-to-many relationships
    hubs = relationship("Hub", secondary=hub_members, back_populates="members")
    teams = relationship("Team", secondary=team_members, back_populates="members")
    meetings = relationship("Meeting", secondary=meeting_participants, back_populates="participants")

class Hub(Base):
    __tablename__ = "hubs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(HubType), nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_hubs")
    members = relationship("User", secondary=hub_members, back_populates="hubs")
    teams = relationship("Team", back_populates="hub", cascade="all, delete-orphan")
    channels = relationship("Channel", back_populates="hub", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="hub", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String, nullable=False)
    hub_id = Column(String, ForeignKey("hubs.id"), nullable=False)
    leader_id = Column(String, ForeignKey("users.id"), nullable=False)
    assistant_id = Column(String, ForeignKey("users.id"), nullable=True)
    channel_id = Column(String, nullable=True)  # Will be set when channel is created
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    hub = relationship("Hub", back_populates="teams")
    leader = relationship("User", foreign_keys=[leader_id], back_populates="led_teams")
    assistant = relationship("User", foreign_keys=[assistant_id], back_populates="assisted_teams")
    members = relationship("User", secondary=team_members, back_populates="teams")
    channel = relationship("Channel", back_populates="team", uselist=False)

class Channel(Base):
    __tablename__ = "channels"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(ChannelType), nullable=False)
    hub_id = Column(String, ForeignKey("hubs.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    hub = relationship("Hub", back_populates="channels")
    team = relationship("Team", back_populates="channel")
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    content = Column(Text, nullable=False)
    channel_id = Column(String, ForeignKey("channels.id"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    channel = relationship("Channel", back_populates="messages")
    sender = relationship("User", back_populates="messages")

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    agenda = Column(Text, nullable=True)  # JSON string of agenda items
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    jitsi_link = Column(String, nullable=True)
    hub_id = Column(String, ForeignKey("hubs.id"), nullable=False)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="scheduled")  # scheduled, active, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    hub = relationship("Hub", back_populates="meetings")
    creator = relationship("User", back_populates="created_meetings")
    participants = relationship("User", secondary=meeting_participants, back_populates="meetings")