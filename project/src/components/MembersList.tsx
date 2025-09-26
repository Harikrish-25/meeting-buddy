import React from 'react';
import { User, Crown, Shield, Users, Briefcase } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface MembersListProps {
  members: Member[];
  currentUserRole: string;
}

const MembersList: React.FC<MembersListProps> = ({ members, currentUserRole }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CEO':
        return <Crown className="text-yellow-600" size={16} />;
      case 'Manager':
        return <Shield className="text-blue-600" size={16} />;
      case 'Team Leader':
        return <Users className="text-green-600" size={16} />;
      case 'Employee':
        return <Briefcase className="text-gray-600" size={16} />;
      default:
        return <User className="text-gray-600" size={16} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CEO':
        return 'bg-yellow-100 text-yellow-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Team Leader':
        return 'bg-green-100 text-green-800';
      case 'Employee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleHierarchy = () => {
    return [
      { role: 'CEO', count: members.filter(m => m.role === 'CEO').length },
      { role: 'Manager', count: members.filter(m => m.role === 'Manager').length },
      { role: 'Team Leader', count: members.filter(m => m.role === 'Team Leader').length },
      { role: 'Employee', count: members.filter(m => m.role === 'Employee').length },
    ];
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-2">No members yet</p>
        <p className="text-sm text-gray-500">
          {currentUserRole === 'CEO' 
            ? 'Start by adding Managers to your organization' 
            : 'Ask your CEO to add more members'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-black">
          Members ({members.length})
        </h3>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getRoleHierarchy().map(({ role, count }) => (
          <div key={role} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              {getRoleIcon(role)}
            </div>
            <div className="text-2xl font-bold text-black">{count}</div>
            <div className="text-sm text-gray-600">{role}s</div>
          </div>
        ))}
      </div>
      
      {/* Members List */}
      <div className="space-y-3">
        {['CEO', 'Manager', 'Team Leader', 'Employee'].map(role => {
          const roleMembers = members.filter(member => member.role === role);
          if (roleMembers.length === 0) return null;

          return (
            <div key={role} className="space-y-2">
              <h4 className="text-md font-medium text-black flex items-center">
                {getRoleIcon(role)}
                <span className="ml-2">{role}s ({roleMembers.length})</span>
              </h4>
              
              <div className="grid gap-3">
                {roleMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Organization Hierarchy</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>🏆 <strong>CEO:</strong> Creates the organization and can add Managers</div>
          <div>👔 <strong>Manager:</strong> Can add Team Leaders and Employees, create meetings</div>
          <div>👥 <strong>Team Leader:</strong> Can participate in meetings and manage team tasks</div>
          <div>👤 <strong>Employee:</strong> Can participate in meetings and collaborate</div>
        </div>
      </div>
    </div>
  );
};

export default MembersList;