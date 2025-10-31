'use client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from "react-toastify";

interface Request {
  _id: string;
  userInfo?: { name?: string; email?: string; profileImage?: string };
  time: string;
  reason: string;
  mode: string;
  status?: string;
  createdAt?: string;
}

const DocterRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/consultation/docter-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(data?.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/consultation/request/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Request ${status}`);
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch (err) {
      toast.error('Server error');
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-emerald-700">
        Consultation Requests
      </h3>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req, index) => (
            <div
              key={req._id}
              className="flex items-center justify-between p-4 border border-emerald-200 rounded-xl bg-white hover:shadow-md transition-all duration-200 hover:bg-emerald-50"
            >
              {/* Left: Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-emerald-700">
                      {req.userInfo?.name || 'Unknown User'}
                    </h4>
                    <p className="text-xs text-gray-500">{req.userInfo?.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 mt-2 items-center text-xs text-gray-700">
                  {/* Editable Time */}
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-700 font-medium">Time:</span>
                    <input
                      type="time"
                      value={req.time}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setRequests((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, time: newTime } : r
                          )
                        );
                      }}
                      onBlur={async (e) => {
                        const newTime = e.target.value;
                        try {
                          const token = localStorage.getItem('authToken');
                          const res = await fetch(
                            `${API_BASE_URL}/api/consultation/requests/${req._id}`,
                            {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ time: newTime }),
                            }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            toast.success('Time updated successfully');
                          } else {
                            toast.error(data.error || 'Failed to update time');
                          }
                        } catch {
                          toast.error('Server error');
                        }
                      }}
                      className="border border-emerald-300 rounded-lg px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                    />
                  </div>

                  <div>
                    <span className="text-emerald-700 font-medium">Mode:</span>{' '}
                    {req.mode}
                  </div>

                  <div className="truncate max-w-[180px] text-gray-600">
                    <span className="text-emerald-700 font-medium">Reason:</span>{' '}
                    {req.reason || 'N/A'}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${req.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {req.status || 'Pending'}
                  </span>
                  {req.createdAt && (
                    <span>{dayjs(req.createdAt).format('MMM D, YYYY')}</span>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              {req.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req._id, 'Approved')}
                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req._id, 'Rejected')}
                    className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      )}

    </div>
  );
};

export default DocterRequests;
