import React, { useState } from 'react';
import { Hub, Channel, ROLE_PERMISSIONS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Hash, Users, Calendar, Send } from 'lucide-react';
import clsx from 'clsx';
import CreateMeetingModal from './CreateMeetingModal';
import { Modal } from './Modal';

interface HubViewProps {
  hub: Hub;
}

const HubView: React.FC<HubViewProps> = ({ hub }) => {
  const { user } = useAuth();
  const { createTeam, addMessageToChannel } = useApp();
  const [selectedChannelId, setSelectedChannelId] = useState(hub.channels[0]?.id);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    department: '',
    leader: '',
    assistant: '',
    members: [] as string[],
  });

  // Get all managers and employees not already assigned as leader/assistant/member in any team
  const assignedUserIds = new Set(hub.teams.flatMap(t => [t.leader, t.assistant, ...t.members].filter(Boolean)));
  const availableManagers = hub.members.filter(m => m.role === 'Manager' && !assignedUserIds.has(m.userId));
  const availableEmployees = hub.members.filter(m => m.role === 'Employee' && !assignedUserIds.has(m.userId));

  // Show all members list
  const [showMembersList, setShowMembersList] = useState(false);

  if (!user) return null;

  const userMember = hub.members.find(m => m.userId === user.id);
  const userPermissions = userMember ? ROLE_PERMISSIONS[userMember.role] : null;
  const selectedChannel = hub.channels.find(c => c.id === selectedChannelId);


  const canAccessChannel = (channel: Channel) => {
    if (channel.type === 'all-members') {
      return userPermissions?.canChatInAllMembers || false;
    }
    if (channel.type === 'team' && channel.teamId) {
      const team = hub.teams.find(t => t.id === channel.teamId);
      // CEO, Manager, HR can access all teams. Team members can access their own team.
      return userMember?.role === 'CEO' || userMember?.role === 'Manager' || userMember?.role === 'HR' ||
             team?.members.includes(user.id) || team?.leader === user.id || team?.assistant === user.id;
    }
    return false;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannel) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      content: messageInput,
      timestamp: new Date().toISOString(),
      avatar: user.avatar,
    };

    addMessageToChannel(hub.id, selectedChannel.id, newMessage);
    setMessageInput('');
  };

  return (
    <div className="h-full flex">
      {/* Channel Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">{hub.name}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{hub.members.length}</span>
            </span>
            {userPermissions?.canCreateMeetings && (
              <button
                onClick={() => setShowCreateMeeting(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Calendar className="w-4 h-4" />
                <span>Meeting</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* All Members Channel */}
          {hub.channels.filter(c => c.type === 'all-members').map(channel => (
            <div key={channel.id}>
              <button
                onClick={() => setSelectedChannelId(channel.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors',
                  selectedChannelId === channel.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                <Hash className="w-4 h-4" />
                <span>{channel.name}</span>
              </button>
            </div>
          ))}

          {/* Team Channels */}
          {hub.teams.map(team => {
            const teamChannel = hub.channels.find(c => c.teamId === team.id);
            return (
              <div key={team.id}>
                {teamChannel && (
                  <button
                    onClick={() => setSelectedChannelId(teamChannel.id)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors',
                      selectedChannelId === teamChannel.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    <Hash className="w-4 h-4" />
                    <span>{team.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {team.members.length + 2}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4">
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg mt-2"
            onClick={() => setShowMembersList(true)}
          >
            See Members
          </button>
        </div>
        <div className="p-4">
          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg mt-2"
            onClick={() => setShowCreateTeam(true)}
          >
            Create Team
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">{selectedChannel.name}</h3>
                {selectedChannel.type === 'team' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Team Channel
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChannel.messages.length > 0 ? (
                selectedChannel.messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <img
                      src={message.avatar || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop`}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Hash className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No messages yet in #{selectedChannel.name}</p>
                  <p className="text-sm">Be the first to send a message!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col gap-2">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canAccessChannel(selectedChannel)}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !canAccessChannel(selectedChannel)}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors',
                    messageInput.trim() && canAccessChannel(selectedChannel)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                  onClick={() => setShowCreateMeeting(true)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Generate Meeting</span>
                </button>
              </div>
              {!canAccessChannel(selectedChannel) && (
                <p className="text-center text-gray-500 text-sm mt-2">
                  You don't have permission to send messages in this channel
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Hash className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Members List Modal */}
      {showMembersList && (
        <Modal onClose={() => setShowMembersList(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Members</h2>
            <ul className="space-y-2">
              {hub.members.map(m => (
                <li key={m.userId} className="flex items-center space-x-3">
                  <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full" />
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.role}</span>
                  <span className="text-xs text-gray-400">{m.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <Modal onClose={() => setShowCreateTeam(false)}>
          <form className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Create Team</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Team Name</label>
              <input
                type="text"
                value={teamForm.name}
                onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                value={teamForm.department}
                onChange={e => setTeamForm(f => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Team Leader</label>
              <select
                value={teamForm.leader}
                onChange={e => setTeamForm(f => ({ ...f, leader: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Manager</option>
                {availableManagers.map(m => (
                  <option key={m.userId} value={m.userId}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assistant Team Leader</label>
              <select
                value={teamForm.assistant}
                onChange={e => setTeamForm(f => ({ ...f, assistant: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Assistant (Manager)</option>
                {availableManagers.filter(m => m.userId !== teamForm.leader).map(m => (
                  <option key={m.userId} value={m.userId}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Team Members</label>
              <div className="space-y-2">
                {availableEmployees.map(emp => (
                  <label key={emp.userId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={teamForm.members.includes(emp.userId)}
                      onChange={e => {
                        setTeamForm(f => ({
                          ...f,
                          members: e.target.checked
                            ? [...f.members, emp.userId]
                            : f.members.filter(id => id !== emp.userId)
                        }));
                      }}
                    />
                    <span>{emp.name} ({emp.email})</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2 bg-green-600 text-white rounded-lg mt-4"
              onClick={() => {
                // Create new team with proper structure
                const newTeam = {
                  name: teamForm.name,
                  description: `${teamForm.department} team`,
                  department: teamForm.department,
                  leader: teamForm.leader,
                  assistant: teamForm.assistant,
                  members: teamForm.members,
                };
                
                createTeam(hub.id, newTeam);
                
                // Reset form and close modal
                setTeamForm({
                  name: '',
                  department: '',
                  leader: '',
                  assistant: '',
                  members: [],
                });
                setShowCreateTeam(false);
              }}
            >
              Create Team
            </button>
          </form>
        </Modal>
      )}

      {/* Create Meeting Modal */}
      {showCreateMeeting && (
        <CreateMeetingModal 
          onClose={() => setShowCreateMeeting(false)}
          hub={hub}
        />
      )}
    </div>
  );
};

export default HubView;