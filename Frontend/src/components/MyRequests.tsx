'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

interface Request {
  _id: string;
  nutritionistInfo?: {
    name?: string;
    email?: string;
    profileImage?: string;
    qualifications?: string;
  };
  time: string;
  reason: string;
  mode: string;
  status?: string;
  chat?: {
    type: "doctor" | "patient";
    message: string;
    timestamp: string;
  }[];
}

const MyRequests = () => {
  const [myRequest, setMyRequest] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [openModal, setOpenModal] = useState<"none" | "details" | "chat" | "video">("none");
  const [newMessage, setNewMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getMyRequest();
  }, []);

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
        setMyRequest(data?.requests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    const token = localStorage.getItem("authToken");

    await fetch(`${API_BASE_URL}/api/consultation/chat/${selectedRequest._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "patient",
        message: newMessage,
      }),
    });

    setNewMessage("");
    getMyRequest(); // refresh chat messages

    setSelectedRequest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chat: [
          ...(prev.chat || []),
          {
            type: "patient",
            message: newMessage,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });
  };



  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-emerald-700">Consultation Requests</h3>

      {myRequest.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {myRequest.map((req) => (
            <div
              key={req._id}
              className="p-5 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition cursor-pointer shadow-sm"
              onClick={() => {
                setSelectedRequest(req);
                setOpenModal("details");
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`${API_BASE_URL}${req.nutritionistInfo?.profileImage}`}
                  alt={req.nutritionistInfo?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-300 shadow"
                />
                <div>
                  <h4 className="text-lg font-semibold text-emerald-700">{req.nutritionistInfo?.name}</h4>
                  <p className="text-sm text-gray-600">{req.nutritionistInfo?.qualifications}</p>
                </div>
              </div>

              <p className="text-sm"><strong>Time:</strong> {req.time}</p>
              <p className="text-sm"><strong>Reason:</strong> {req.reason}</p>
              <p className="text-sm"><strong>Mode:</strong> {req.mode}</p>
              <p className="text-sm mt-1">
                <strong>Status:</strong>{" "}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : req.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {req.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {openModal === "details" && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button onClick={() => setOpenModal("none")} className="absolute top-2 right-2 font-bold text-red-600">X</button>

            <h4 className="font-semibold text-emerald-700 mb-3">Request Details</h4>

            <p><strong>Nutritionist:</strong> {selectedRequest.nutritionistInfo?.name}</p>
            <p><strong>Email:</strong> {selectedRequest.nutritionistInfo?.email}</p>
            <p><strong>Time:</strong> {selectedRequest.time}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            <p><strong>Mode:</strong> {selectedRequest.mode}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>

            {selectedRequest.status === "Approved" && (
              <div className="mt-5 flex gap-3">
                <button onClick={() => setOpenModal("chat")} className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Chat</button>

                {selectedRequest.mode === "Video" && (
                  <button onClick={() => setOpenModal("video")} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Video Call</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CHAT MODAL --- */}
      {openModal === "chat" && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">Chat with Nutritionist</h2>

            <div className="border rounded-md h-52 p-2 overflow-y-auto flex flex-col gap-2 text-sm">
              {selectedRequest.chat?.length ? selectedRequest.chat.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded-md max-w-[75%] ${msg.type === "patient" ? "bg-emerald-100 self-end" : "bg-gray-100 self-start"
                  }`}>
                  {msg.message}
                </div>
              )) : <p className="text-center text-gray-400">No messages yet...</p>}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border p-2 rounded"
                placeholder="Type message..."
              />
              <button onClick={handleSendMessage} className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Send</button>
            </div>

            <button onClick={() => setOpenModal("details")} className="mt-3 text-sm text-gray-500 underline">Back</button>
          </div>
        </div>
      )}

      {/* --- VIDEO MODAL --- */}
      {openModal === "video" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-emerald-700 mb-3">Video Consultation</h2>
            <p className="text-gray-600">Video call UI will be implemented here.</p>

            <button onClick={() => setOpenModal("details")} className="mt-3 text-sm text-gray-500 underline">Back</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyRequests;
