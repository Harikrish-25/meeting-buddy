import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, Users, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Hub, Meeting } from '../types';
import clsx from 'clsx';

interface CreateMeetingModalProps {
  onClose: () => void;
  hub: Hub;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ onClose, hub }) => {
  const { user } = useAuth();
  const { addMeeting } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    scheduledFor: '',
    duration: 60,
    participants: [] as string[],
    agenda: ['', '', ''],
  });

  const [generatedMeeting, setGeneratedMeeting] = useState<Meeting | null>(null);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }));
  };

  const updateAgendaItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => i === index ? value : item)
    }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, '']
    }));
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateMeeting = async () => {
    setLoading(true);
    try {
      const meetingData: Omit<Meeting, 'id' | 'jitsiLink'> = {
        title: formData.title,
        hubId: hub.id,
        agenda: formData.agenda.filter(item => item.trim()),
        participants: formData.participants,
        createdBy: user.id,
        scheduledFor: formData.scheduledFor,
        duration: formData.duration,
        status: 'scheduled',
        joinLogs: [],
      };

      addMeeting(meetingData);
      
      // For demo purposes, create a mock meeting with Jitsi link
      const newMeeting: Meeting = {
        ...meetingData,
        id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jitsiLink: `https://meet.jit.si/AIMeetingBuddy${Date.now()}`,
      };

      setGeneratedMeeting(newMeeting);
      setStep(2);
    } catch (error) {
      console.error('Error generating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = () => {
    if (generatedMeeting) {
      window.open(generatedMeeting.jitsiLink, '_blank');
    }
  };

  if (step === 2 && generatedMeeting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Meeting Generated!</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {generatedMeeting.title}
              </h3>
              <p className="text-gray-600">
                Scheduled for {new Date(generatedMeeting.scheduledFor).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Duration</span>
                <span className="text-sm text-gray-600">{generatedMeeting.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Participants</span>
                <span className="text-sm text-gray-600">{generatedMeeting.participants.length} people</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Agenda Items</span>
                <span className="text-sm text-gray-600">{generatedMeeting.agenda.length} items</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleJoinMeeting}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Join Meeting Now</span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Meeting Link:</p>
                <div className="bg-gray-50 p-2 rounded border text-xs text-gray-600 break-all">
                  {generatedMeeting.jitsiLink}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generate AI Meeting</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Meeting Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Q1 Planning Meeting"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Select Participants</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hub.members.map((member) => (
                <label key={member.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(member.userId)}
                    onChange={() => toggleParticipant(member.userId)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <img
                    src={member.avatar || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop`}
                    alt={member.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Meeting Agenda</h3>
              <button
                type="button"
                onClick={addAgendaItem}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {formData.agenda.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                  {index + 1}
                </div>
                <input
                  type="text"
                  placeholder={`Agenda item ${index + 1}`}
                  value={item}
                  onChange={(e) => updateAgendaItem(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.agenda.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateMeeting}
              disabled={loading || !formData.title || !formData.scheduledFor || formData.participants.length === 0}
              className={clsx(
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2',
                loading || !formData.title || !formData.scheduledFor || formData.participants.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate Meeting'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;