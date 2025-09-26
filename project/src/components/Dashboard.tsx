import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Sidebar from './Sidebar';
import HubView from './HubView'; // Use default import
import CreateHubModal from './CreateHubModal';
import MeetingHistoryModal from './MeetingHistoryModal';
import ChatbotHistoryModal from './ChatbotHistoryModal';
import { LogOut, Settings, User, Bot } from 'lucide-react'; // Remove unused ChevronDown

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { getUserHubs, currentHubId, setCurrentHub, getCurrentHub } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateHub, setShowCreateHub] = useState(false);
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [showChatbotHistory, setShowChatbotHistory] = useState(false);
  const [showMyHubs, setShowMyHubs] = useState(true);

  const userHubs = getUserHubs();
  const currentHub = getCurrentHub();

  useEffect(() => {
    // If a hub is selected, hide My Hubs section
    if (currentHub) {
      setShowMyHubs(false);
    }
  }, [currentHub]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Meeting Buddy</h1>
              {currentHub && (
                <p className="text-sm text-gray-500">{currentHub.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          >
            <img
              src={user?.avatar || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop`}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <hr className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onCreateHub={() => setShowCreateHub(true)} onShowMyHubs={() => { setShowMyHubs(true); setCurrentHub(''); }} />
        <main className="flex-1 bg-white overflow-hidden">
          {/* My Hubs Section */}
          {showMyHubs ? (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">My Hubs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userHubs.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => { setCurrentHub(hub.id); setShowMyHubs(false); }}
                    className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg p-6 text-left transition-all duration-200 flex flex-col items-start"
                  >
                    <div className="flex items-center mb-2">
                      <Bot className="w-6 h-6 text-blue-600 mr-2" />
                      <span className="font-semibold text-lg text-gray-900">{hub.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{hub.members.length} members</div>
                    <div className="mt-2 text-sm text-gray-700">Type: {hub.type}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : currentHub ? (
            <HubView hub={currentHub} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Bot className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to AI Meeting Buddy!</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Get started by creating your first hub to organize your team and projects.
                </p>
                <button
                  onClick={() => setShowCreateHub(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                >
                  Create Your First Hub
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateHub && (
        <CreateHubModal onClose={() => setShowCreateHub(false)} />
      )}

      {showMeetingHistory && (
        <MeetingHistoryModal 
          onClose={() => setShowMeetingHistory(false)}
          hubId={currentHubId}
        />
      )}

      {showChatbotHistory && (
        <ChatbotHistoryModal 
          onClose={() => setShowChatbotHistory(false)}
          hubId={currentHubId}
        />
      )}
    </div>
  );
};

export default Dashboard;