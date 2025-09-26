export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Hub {
  id: string;
  name: string;
  type: 'corporate' | 'startup' | 'nonprofit' | 'team';
  creator: string;
  createdAt: string;
  members: HubMember[];
  teams: Team[];
  channels: Channel[];
}

export interface HubMember {
  userId: string;
  name: string;
  email: string;
  role: 'CEO' | 'Manager' | 'HR' | 'Employee';
  joinedAt: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  department?: string;
  leader: string; // userId of team leader
  assistant: string; // userId of assistant team leader
  members: string[]; // user IDs
  channelId: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'team' | 'all-members';
  teamId?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

export interface Meeting {
  id: string;
  title: string;
  hubId: string;
  agenda: string[];
  participants: string[];
  createdBy: string;
  scheduledFor: string;
  duration: number;
  jitsiLink: string;
  status: 'scheduled' | 'active' | 'completed';
  joinLogs: JoinLog[];
  summary?: string;
}

export interface JoinLog {
  userId: string;
  userName: string;
  action: 'join' | 'leave';
  timestamp: string;
}

export interface ChatbotHistory {
  id: string;
  hubId: string;
  type: 'meeting_summary' | 'team_question';
  title: string;
  query: string;
  response: string;
  timestamp: string;
  meetingId?: string;
}

export type RolePermission = {
  canCreateMeetings: boolean;
  canChatInAllMembers: boolean;
  canManageHub: boolean;
  canViewAllChannels: boolean;
};

export const ROLE_PERMISSIONS: Record<HubMember['role'], RolePermission> = {
  CEO: {
    canCreateMeetings: true,
    canChatInAllMembers: true,
    canManageHub: true,
    canViewAllChannels: true,
  },
  Manager: {
    canCreateMeetings: true,
    canChatInAllMembers: true,
    canManageHub: false,
    canViewAllChannels: true,
  },
  HR: {
    canCreateMeetings: true,
    canChatInAllMembers: true,
    canManageHub: false,
    canViewAllChannels: true,
  },
  Employee: {
    canCreateMeetings: false,
    canChatInAllMembers: false,
    canManageHub: false,
    canViewAllChannels: false,
  },
};