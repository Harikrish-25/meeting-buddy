import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Hub, Meeting, ChatbotHistory } from '../types';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api';

interface AppState {
  hubs: Hub[];
  currentHubId: string | null;
  meetings: Meeting[];
  chatbotHistory: ChatbotHistory[];
}

interface AppContextType extends AppState {
  setCurrentHub: (hubId: string | null) => void;
  createHub: (hub: Omit<Hub, 'id' | 'createdAt'>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'jitsiLink'>) => void;
  addChatbotEntry: (entry: Omit<ChatbotHistory, 'id' | 'timestamp'>) => void;
  createTeam: (hubId: string, teamData: any) => void;
  addMessageToChannel: (hubId: string, channelId: string, message: any) => void;
  getCurrentHub: () => Hub | null;
  getUserHubs: () => Hub[];
}

const AppContext = createContext<AppContextType | null>(null);

type AppAction =
  | { type: 'SET_CURRENT_HUB'; payload: string | null }
  | { type: 'CREATE_HUB'; payload: Hub }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'ADD_CHATBOT_ENTRY'; payload: ChatbotHistory }
  | { type: 'LOAD_DATA'; payload: { hubs: Hub[]; meetings: Meeting[]; chatbotHistory: ChatbotHistory[] } };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_HUB':
      return { ...state, currentHubId: action.payload };
    case 'CREATE_HUB':
      return { ...state, hubs: [...state.hubs, action.payload] };
    case 'ADD_MEETING':
      return { ...state, meetings: [...state.meetings, action.payload] };
    case 'ADD_CHATBOT_ENTRY':
      return { ...state, chatbotHistory: [...state.chatbotHistory, action.payload] };
    case 'LOAD_DATA':
      return {
        ...state,
        hubs: action.payload.hubs,
        meetings: action.payload.meetings,
        chatbotHistory: action.payload.chatbotHistory,
      };
    default:
      return state;
  }
};

const initialState: AppState = {
  hubs: [],
  currentHubId: null,
  meetings: [],
  chatbotHistory: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user-specific data from localStorage
      const storageKey = `app_data_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          dispatch({ type: 'LOAD_DATA', payload: data });
        } catch (error) {
          // Load mock data if no saved data
          dispatch({
            type: 'LOAD_DATA',
            payload: {
              hubs: mockHubsData,
              meetings: mockMeetingsData,
              chatbotHistory: mockChatbotHistory,
            },
          });
        }
      } else {
        // Load mock data for new users
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            hubs: mockHubsData,
            meetings: mockMeetingsData,
            chatbotHistory: mockChatbotHistory,
          },
        });
      }
    }
  }, [isAuthenticated, user]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (user && isAuthenticated) {
      const storageKey = `app_data_${user.id}`;
      const dataToSave = {
        hubs: state.hubs,
        meetings: state.meetings,
        chatbotHistory: state.chatbotHistory,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [state, user, isAuthenticated]);

  const setCurrentHub = (hubId: string | null) => {
    dispatch({ type: 'SET_CURRENT_HUB', payload: hubId });
    if (user) {
      localStorage.setItem(`current_hub_${user.id}`, hubId || '');
    }
  };

  const createHub = (hubData: Omit<Hub, 'id' | 'createdAt'>) => {
    const newHub: Hub = {
      ...hubData,
      id: `hub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_HUB', payload: newHub });
  };

  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'jitsiLink'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jitsiLink: `https://meet.jit.si/AIMeetingBuddy${Date.now()}`,
    };
    dispatch({ type: 'ADD_MEETING', payload: newMeeting });
  };

  const addChatbotEntry = (entryData: Omit<ChatbotHistory, 'id' | 'timestamp'>) => {
    const newEntry: ChatbotHistory = {
      ...entryData,
      id: `chatbot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CHATBOT_ENTRY', payload: newEntry });
  };

  const getCurrentHub = (): Hub | null => {
    return state.hubs.find(hub => hub.id === state.currentHubId) || null;
  };

  const createTeam = (hubId: string, teamData: any) => {
    const newTeam = {
      ...teamData,
      id: `team_${Date.now()}`,
      channelId: `channel_${Date.now()}`,
    };
    const newChannel = {
      id: newTeam.channelId,
      name: newTeam.name,
      type: 'team' as const,
      teamId: newTeam.id,
      messages: [],
    };
    
    const updatedHubs = state.hubs.map(hub => {
      if (hub.id === hubId) {
        return {
          ...hub,
          teams: [...hub.teams, newTeam],
          channels: [...hub.channels, newChannel],
        };
      }
      return hub;
    });
    
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        hubs: updatedHubs,
        meetings: state.meetings,
        chatbotHistory: state.chatbotHistory,
      },
    });
  };

  const addMessageToChannel = (hubId: string, channelId: string, message: any) => {
    const updatedHubs = state.hubs.map(hub => {
      if (hub.id === hubId) {
        return {
          ...hub,
          channels: hub.channels.map(channel => {
            if (channel.id === channelId) {
              return {
                ...channel,
                messages: [...channel.messages, message],
              };
            }
            return channel;
          }),
        };
      }
      return hub;
    });
    
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        hubs: updatedHubs,
        meetings: state.meetings,
        chatbotHistory: state.chatbotHistory,
      },
    });
  };

  const getUserHubs = (): Hub[] => {
    if (!user) return [];
    return state.hubs.filter(hub => 
      hub.members.some(member => member.userId === user.id)
    );
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentHub,
        createHub,
        addMeeting,
        addChatbotEntry,
        createTeam,
        addMessageToChannel,
        getCurrentHub,
        getUserHubs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};