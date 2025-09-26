import React, { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (email: string, role: string) => Promise<void>;
  hubId: string;
  userRole: string; // Current user's role in the hub
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  userRole
}) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Role options based on current user's role - Following the hierarchy
  const getRoleOptions = () => {
    if (userRole === 'CEO') {
      return [
        { value: 'Manager', label: 'Manager' }
      ];
    } else if (userRole === 'Manager') {
      return [
        { value: 'Team Leader', label: 'Team Leader' },
        { value: 'Employee', label: 'Employee' }
      ];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onAddMember(email, selectedRole);
      setEmail('');
      setSelectedRole('');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = getRoleOptions();

  if (!isOpen) {
    return null;
  }

  if (!roleOptions.length) {
    return null; // User doesn't have permission to add members
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center">
            <UserPlus className="mr-2" size={20} />
            Add Member
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member's email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              required
            >
              <option value="">Select a role</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {userRole === 'CEO' 
                ? 'As CEO, you can add Managers to your organization' 
                : 'As Manager, you can add Team Leaders and Employees'}
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-black mb-2">Role Hierarchy:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>🏆 <strong>CEO:</strong> Can add Managers</div>
            <div>👔 <strong>Manager:</strong> Can add Team Leaders & Employees</div>
            <div>👥 <strong>Team Leader:</strong> Cannot add members</div>
            <div>👤 <strong>Employee:</strong> Cannot add members</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;