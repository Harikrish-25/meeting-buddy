import React, { useState } from 'react';
import { X, Bot, MessageCircle, Calendar, Search, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import clsx from 'clsx';

interface ChatbotHistoryModalProps {
  onClose: () => void;
  hubId: string | null;
}

const ChatbotHistoryModal: React.FC<ChatbotHistoryModalProps> = ({ onClose, hubId }) => {
  const { chatbotHistory, addChatbotEntry } = useApp();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const hubChatHistory = chatbotHistory.filter(entry => entry.hubId === hubId);
  const selectedChatEntry = hubChatHistory.find(entry => entry.id === selectedEntry);

  const handleNewQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || !hubId) return;

    setLoading(true);
    try {
      // Simulate AI response generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = generateMockResponse(newQuery);
      
      addChatbotEntry({
        hubId,
        type: 'team_question',
        title: newQuery.length > 50 ? `${newQuery.substring(0, 50)}...` : newQuery,
        query: newQuery,
        response: mockResponse,
      });

      setNewQuery('');
      setShowNewChat(false);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const responses = [
      `Based on your team's recent activity and communication patterns, here's what I found regarding "${query}":\n\n• Your team has shown strong collaboration in recent discussions\n• Key stakeholders are actively engaged in project initiatives\n• Communication flow is efficient across all channels\n\nWould you like me to provide more specific insights or recommendations?`,
      `I've analyzed the relevant information for "${query}" and here are my recommendations:\n\n• Consider scheduling regular check-ins to maintain momentum\n• Documentation of key decisions should be prioritized\n• Team members seem well-aligned on current objectives\n\nThis approach should help optimize your team's performance and collaboration.`,
      `Regarding "${query}", I've identified several important points:\n\n• Current team dynamics are positive and productive\n• Resource allocation appears to be well-balanced\n• Communication channels are being utilized effectively\n\nI recommend continuing with the current strategy while monitoring for any emerging challenges.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting_summary':
        return <Calendar className="w-4 h-4" />;
      case 'team_question':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting_summary':
        return 'Meeting Summary';
      case 'team_question':
        return 'Team Question';
      default:
        return 'General';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-6 h-6" />
                <h2 className="text-xl font-semibold">AI Assistant</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={() => setShowNewChat(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {hubChatHistory.length > 0 ? (
              hubChatHistory.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry.id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg transition-colors border',
                    selectedEntry === entry.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(entry.type)}
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {getTypeLabel(entry.type)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No chat history yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {showNewChat ? (
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Ask AI Assistant</h3>
                <p className="text-sm text-gray-600">Ask questions about your team, meetings, or get insights</p>
              </div>
              
              <div className="flex-1 p-6">
                <form onSubmit={handleNewQuery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to know?
                    </label>
                    <textarea
                      value={newQuery}
                      onChange={(e) => setNewQuery(e.target.value)}
                      placeholder="e.g., Summarize our team's recent performance, What are the best practices for remote meetings?, How can we improve team communication?"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewChat(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !newQuery.trim()}
                      className={clsx(
                        'px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2',
                        loading || !newQuery.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                      )}
                    >
                      <Search className="w-4 h-4" />
                      <span>{loading ? 'Thinking...' : 'Ask AI'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedChatEntry ? (
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(selectedChatEntry.type)}
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {getTypeLabel(selectedChatEntry.type)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{selectedChatEntry.title}</h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedChatEntry.timestamp), 'MMMM dd, yyyy at HH:mm')}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Your Question</span>
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedChatEntry.query}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <span>AI Response</span>
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      {selectedChatEntry.response.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 text-gray-700">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Assistant</h3>
                <p className="text-gray-600 mb-6 max-w-sm">
                  Select a conversation from the sidebar or start a new chat to get AI-powered insights about your team.
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium flex items-center space-x-2 mx-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start New Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotHistoryModal;