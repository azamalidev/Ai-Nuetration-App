'use client';
import { useState } from 'react';

interface MyRequestsProps {
  requests?: any[];
}

const MyRequests = ({ requests = [] }: MyRequestsProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-emerald-700">My Requehhkhsts</h3>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="p-4 border rounded bg-emerald-50 cursor-pointer"
              onClick={() => { setSelectedRequest(req); setModalOpen(true); }}
            >
              <h4 className="font-semibold text-emerald-700">{req.nutritionistId?.name || "N/A"}</h4>
              <p>Time: {req.time}</p>
              <p>Reason: {req.reason}</p>
              <p>Mode: {req.mode}</p>
              <p>Status: {req.status || "Pending"}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-red-600 font-bold">X</button>
            <h4 className="font-semibold text-emerald-700 mb-2">Request Details</h4>
            <p><strong>Nutritionist:</strong> {selectedRequest.nutritionistId?.name || "N/A"}</p>
            <p><strong>Email:</strong> {selectedRequest.nutritionistId?.email || "N/A"}</p>
            <p><strong>Time:</strong> {selectedRequest.time}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            <p><strong>Mode:</strong> {selectedRequest.mode}</p>
            <p><strong>Status:</strong> {selectedRequest.status || "Pending"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
