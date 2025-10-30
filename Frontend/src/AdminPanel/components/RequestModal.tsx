import React from 'react';
import { X } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  request: any | null; // Should contain user info and request details
  onClose: () => void;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, request, onClose, onApprove, onDeny }) => {
  if (!isOpen || !request) return null;

  const user = request.user || {}; // Assuming request.user contains user info

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-white mb-6">Request Summary</h2>

        {/* User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200 mb-6">
          <div>
            <p><strong>Name:</strong> {user.name || request.userName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age || 'N/A'}</p>
            <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Weight:</strong> {user.weight ? `${user.weight} kg` : 'N/A'}</p>
            <p><strong>Height:</strong> {user.height ? `${user.height} cm` : 'N/A'}</p>
            <p><strong>Activity Level:</strong> {user.activityLevel || 'N/A'}</p>
            <p><strong>Health Goal:</strong> {user.healthGoal || 'N/A'}</p>
          </div>
        </div>

        {/* Dietary Preferences / Additional Details */}
        {user.dietaryPreferance && (
          <div className="mb-6 text-gray-200">
            <p><strong>Dietary Preferences:</strong> {user.dietaryPreferance}</p>
          </div>
        )}

        {/* Request Info */}
        <div className="mb-6 text-gray-200">
          <p><strong>Request Type:</strong> {request.type}</p>
          <p><strong>Date:</strong> {new Date(request.date).toLocaleString()}</p>
          {request.details && <p><strong>Additional Details:</strong> {request.details}</p>}
        </div>

        {/* Approve / Deny Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => onApprove(request._id)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => onDeny(request._id)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
