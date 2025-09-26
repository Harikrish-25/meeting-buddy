const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData: { email: string; name: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setToken(response.access_token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  // Hubs
  async createHub(hubData: any) {
    return this.request<any>('/hubs', {
      method: 'POST',
      body: JSON.stringify(hubData),
    });
  }

  async getUserHubs() {
    return this.request<any[]>('/hubs');
  }

  async getHub(hubId: string) {
    return this.request<any>(`/hubs/${hubId}`);
  }

  // Teams
  async createTeam(hubId: string, teamData: any) {
    return this.request<any>(`/hubs/${hubId}/teams`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  // Messages
  async sendMessage(channelId: string, content: string) {
    return this.request<any>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, channelId }),
    });
  }

  async getMessages(channelId: string) {
    return this.request<any[]>(`/channels/${channelId}/messages`);
  }

  // Meetings
  async createMeeting(hubId: string, meetingData: any) {
    return this.request<any>(`/hubs/${hubId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  async getHubMeetings(hubId: string) {
    return this.request<any[]>(`/hubs/${hubId}/meetings`);
  }
}

export const apiClient = new ApiClient();