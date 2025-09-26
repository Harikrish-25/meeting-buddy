import React from 'react';
import { X, Calendar, Users, Clock, ExternalLink, Play, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import clsx from 'clsx';

interface MeetingHistoryModalProps {
  onClose: () => void;
  hubId: string | null;
}

const MeetingHistoryModal: React.FC<MeetingHistoryModalProps> = ({ onClose, hubId }) => {
  const { meetings } = useApp();

  const hubMeetings = meetings.filter(meeting => meeting.hubId === hubId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleJoinMeeting = (jitsiLink: string) => {
    window.open(jitsiLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Meeting History</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {hubMeetings.length > 0 ? (
            <div className="space-y-4">
              {hubMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
                          getStatusColor(meeting.status)
                        )}>
                          {getStatusIcon(meeting.status)}
                          <span className="capitalize">{meeting.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(meeting.scheduledFor), 'MMM dd, yyyy HH:mm')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.duration} minutes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{meeting.participants.length} participants</span>
                        </span>
                      </div>
                    </div>
                    {meeting.status !== 'completed' && (
                      <button
                        onClick={() => handleJoinMeeting(meeting.jitsiLink)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    )}
                  </div>

                  {/* Agenda */}
                  {meeting.agenda.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Agenda</h4>
                      <ul className="space-y-1">
                        {meeting.agenda.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  {meeting.summary && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Meeting Summary</h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {meeting.summary}
                      </p>
                    </div>
                  )}

                  {/* Join Logs */}
                  {meeting.joinLogs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Join Activity</h4>
                      <div className="space-y-2">
                        {meeting.joinLogs.map((log, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className={clsx(
                              'w-2 h-2 rounded-full',
                              log.action === 'join' ? 'bg-green-500' : 'bg-red-500'
                            )}></div>
                            <span className="text-gray-600">
                              <span className="font-medium">{log.userName}</span> {log.action}ed at{' '}
                              {format(new Date(log.timestamp), 'HH:mm')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first meeting to start collaborating with your team.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHistoryModal;