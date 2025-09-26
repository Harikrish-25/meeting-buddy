# AI Meeting Buddy - Full-Stack Demo

A comprehensive full-stack application for AI-powered team collaboration and meeting management built with React, TypeScript, Tailwind CSS, and FastAPI.

## Features

### Frontend Features
- **Landing Page**: Beautiful hero section with product showcase and sign-in modal
- **Authentication**: Email/password login with demo accounts
- **Multi-Hub Support**: Create and switch between multiple organization hubs
- **Role-Based Access**: Admin, Manager, HR, and Member permissions
- **Team Management**: Organize teams with dedicated channels
- **Chat System**: Real-time messaging with team and all-members channels
- **Meeting Generation**: AI-powered meeting creation with Jitsi integration
- **Meeting History**: View past, current, and scheduled meetings
- **AI Chatbot**: Get meeting summaries and team insights
- **Responsive Design**: Mobile-first design with SaaS-inspired aesthetics

### Backend Features
- **FastAPI REST API**: High-performance async API
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Permissions**: Enforce access control across endpoints
- **Hub Management**: Create and manage organization hubs
- **Meeting APIs**: Full CRUD operations for meetings
- **Chatbot Integration**: AI-powered responses and summaries
- **Demo Data**: Pre-loaded with sample users and content

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python 3.8+, JWT, bcrypt
- **State Management**: React Context API
- **Storage**: localStorage (frontend), In-memory (backend demo)
- **Styling**: Tailwind CSS with custom gradients and animations
- **Icons**: Lucide React
- **Video Calls**: Jitsi Meet integration

## Getting Started

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-meeting-buddy
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Demo Accounts

Use these pre-configured demo accounts to explore different role permissions:

- **Admin**: admin@company.com / admin123
- **Manager**: manager@company.com / manager123  
- **Member**: john@company.com / john123

## Architecture

### Frontend Structure
```
src/
├── components/           # React components
├── contexts/            # React Context providers
├── types/               # TypeScript type definitions
├── data/                # Mock data and utilities
└── App.tsx             # Main application component
```

### Backend Structure
```
backend/
├── main.py             # FastAPI application
└── requirements.txt    # Python dependencies
```

### Key Features Implementation

#### Conditional Sidebar Behavior
The sidebar dynamically shows content based on hub creation status:
- **Before hub creation**: Only "Create New Hub" button
- **After hub creation**: Full sidebar with hub dropdown, meeting history, chatbot history

#### Role-Based Permissions
- **Admin/Manager/HR**: Can create meetings, chat in all channels, manage hubs
- **Members**: Limited to team channels they belong to

#### Multi-Hub Support
Users can create and switch between multiple hubs with persistent state management.

#### AI Integration
Mock AI responses for:
- Meeting summaries
- Team question answering
- Organizational insights

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Hubs
- `POST /hubs/create` - Create new hub
- `GET /hubs/{hub_id}` - Get hub details
- `GET /hubs` - Get user's hubs

### Meetings  
- `POST /meetings/create` - Create meeting
- `GET /meetings/{meeting_id}` - Get meeting details
- `GET /meetings?hub_id={hub_id}` - Get hub meetings
- `POST /meetings/{meeting_id}/join` - Join meeting
- `POST /meetings/{meeting_id}/leave` - Leave meeting

### Chatbot
- `POST /bot/query` - Ask AI question
- `POST /bot/summarize` - Summarize meeting
- `GET /bot/history/{hub_id}` - Get chat history

## Design System

### Colors
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)  
- Accent: Green (#10B981)
- Success: Green shades
- Warning: Orange shades
- Error: Red shades

### Typography
- Headings: 120% line height
- Body text: 150% line height
- Max 3 font weights

### Spacing
- 8px spacing system
- Consistent padding and margins
- Proper visual hierarchy

## Development Notes

### Mock Data
The application includes comprehensive mock data for:
- Sample users with different roles
- Pre-configured hubs and teams
- Example meetings and chat history
- AI chatbot interactions

### LocalStorage Persistence
Frontend state persists across browser sessions using localStorage for:
- User authentication tokens
- Hub data and current selection
- Meeting history
- Chatbot conversations

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Touch-friendly interfaces
- Optimized layouts for all screen sizes

## Production Considerations

For production deployment, consider:

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Real-time Features**: Add WebSocket support for live chat
3. **File Upload**: Implement file sharing in channels
4. **Email Notifications**: Add email alerts for meetings
5. **Advanced AI**: Integrate with OpenAI/Anthropic APIs
6. **Security**: Add rate limiting, input validation, HTTPS
7. **Deployment**: Use Docker, cloud hosting, CDN

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly across different roles
5. Submit a pull request

## License

This project is for demonstration purposes. See LICENSE file for details.