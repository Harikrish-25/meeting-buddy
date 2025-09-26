import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Hub } from '../types';
import clsx from 'clsx';

interface CreateHubModalProps {
  onClose: () => void;
}

const CreateHubModal: React.FC<CreateHubModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createHub } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'corporate' as Hub['type'],
    description: '',
  });

  // Define allowed roles for members
  const allowedRoles = ['CEO', 'Manager', 'HR', 'Employee'] as const;
  type MemberRole = typeof allowedRoles[number];

  const [members, setMembers] = useState<{
    email: string;
    role: MemberRole;
  }[]>([
    { email: '', role: 'Employee' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addMember = () => {
    setMembers(prev => [...prev, { email: '', role: 'Employee' }]);
  };

  const removeMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value as MemberRole } : member
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
    // Only create all-members channel
    const channels = [
      {
        id: 'channel_all_members',
        name: 'All Members',
        type: 'all-members' as const,
        messages: [{
          id: `msg_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          content: `Welcome to ${formData.name}! Looking forward to working with everyone.`,
          timestamp: new Date().toISOString(),
          avatar: user.avatar,
        }],
      }
    ];      // Create hub members including current user as selected role
      const hubMembers = [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: members[0]?.role,
          joinedAt: new Date().toISOString(),
          avatar: user.avatar,
        },
        ...members.slice(1).filter(m => m.email).map((member, index) => ({
          userId: `member_${Date.now()}_${index}`,
          name: '',
          email: member.email,
          role: member.role,
          joinedAt: new Date().toISOString(),
          avatar: `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`,
        })),
      ];

      const newHub = {
        name: formData.name,
        type: formData.type,
        creator: user.id,
        members: hubMembers,
        teams: [],
        channels,
      };

      createHub(newHub);
      onClose();
    } catch (error) {
      console.error('Error creating hub:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New Hub</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hub Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., TechCorp Solutions"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hub Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="corporate">Corporate</option>
                  <option value="startup">Startup</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                <select
                  value={members[0]?.role || 'CEO'}
                  onChange={e => updateMember(0, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CEO">CEO</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Section Only */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Members</h3>
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
            {members.map((member, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Member {index + 1}</span>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={member.email}
                    onChange={e => updateMember(index, 'email', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={member.role}
                    onChange={e => updateMember(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {allowedRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
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
              type="submit"
              disabled={loading || !formData.name}
              className={clsx(
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                loading || !formData.name
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              )}
            >
              {loading ? 'Creating...' : 'Create Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHubModal;