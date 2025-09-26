import React from 'react';
import { Plus, Users } from 'lucide-react';

interface SidebarProps {
  onCreateHub: () => void;
  onShowMyHubs: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateHub, onShowMyHubs }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col space-y-4">
      <button
        onClick={onCreateHub}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Create New Hub</span>
      </button>
      <button
        onClick={onShowMyHubs}
        className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 font-medium flex items-center space-x-2"
      >
        <Users className="w-5 h-5 text-blue-600" />
        <span>My Hubs</span>
      </button>
    </div>
  );
};

export default Sidebar;