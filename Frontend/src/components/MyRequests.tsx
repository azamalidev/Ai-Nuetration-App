'use client';

import { useEffect, useState } from 'react';

// adjust this path to your actual config

interface Request {
  _id: string;
  nutritionistId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  time: string;
  reason: string;
  mode: string;
  status?: string;
}


const MyRequests = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [myRequest, setMyRequest] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    getMyRequest()
  }, [1000]);

  const getMyRequest = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/consultation/my-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

      });

      const data = await res.json();

      if (res.ok) {
        console.log('Fetched Requests:', data);
        setMyRequest(data?.requests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-emerald-700">Consultation Requests</h3>

      {/* List of requests */}
      {myRequest?.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {myRequest.map((req: any) => (
            <div
              key={req._id}
              className="p-5 border border-emerald-200 rounded-xl bg-white hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              {/* Header: Nutritionist Info */}
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`${import.meta.env.VITE_API_URL}${req.nutritionistInfo?.profileImage}`}
                  alt={req.nutritionistInfo?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-300 shadow"
                />
                <div>
                  <h4 className="text-lg font-semibold text-emerald-700">
                    {req.nutritionistInfo?.name || "N/A"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {req.nutritionistInfo?.qualifications || "No qualifications listed"}
                  </p>
                  <p className="text-xs text-gray-500">{req.nutritionistInfo?.email}</p>
                </div>
              </div>

              {/* Request Details */}
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold text-emerald-700">Time:</span>{" "}
                  {req.time || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Reason:</span>{" "}
                  {req.reason || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Mode:</span>{" "}
                  {req.mode || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Status:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {req.status || "Pending"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal for request details */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold"
            >
              X
            </button>
            <h4 className="font-semibold text-emerald-700 mb-2">Request Details</h4>
            <p>
              <strong>Nutritionist:</strong>{' '}
              {selectedRequest.nutritionistId?.name || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong>{' '}
              {selectedRequest.nutritionistId?.email || 'N/A'}
            </p>
            <p>
              <strong>Time:</strong> {selectedRequest.time}
            </p>
            <p>
              <strong>Reason:</strong> {selectedRequest.reason}
            </p>
            <p>
              <strong>Mode:</strong> {selectedRequest.mode}
            </p>
            <p>
              <strong>Status:</strong> {selectedRequest.status || 'Pending'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
