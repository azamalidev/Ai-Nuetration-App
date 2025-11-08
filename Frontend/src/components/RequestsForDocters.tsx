'use client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from "react-toastify";
import { MessageCircle, Video } from 'lucide-react';
import axios from 'axios';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useNavigate } from "react-router-dom";

interface Request {
  _id: string;
  userInfo?: { name?: string; email?: string; profileImage?: string };
  time: string;
  reason: string;
  mode: string;
  status?: string;
  createdAt?: string;
  chat: ChatMessage[];
}

type ChatMessage = {
  type: "doctor" | "patient";
  message: string;
  timestamp: string;
};



const DocterRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
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

  const handleAction = async (id: string, time: any, status: 'Approved' | 'Rejected') => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/consultation/request/${id}?status=${encodeURIComponent(status)}&time=${encodeURIComponent(time)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );


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

  const [openModal, setOpenModal] = useState(); // "chat" | "video" | null
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    let token = localStorage.getItem("authToken");

    try {
      await axios.patch(
        `${API_BASE_URL}/api/consultation/chat/${selectedRequest?._id}`,
        {
          type: "doctor",
          message: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token added here
            "Content-Type": "application/json",
          },
        }
      );

      setNewMessage("");
      fetchRequests(); // Refresh UI
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const client = useStreamVideoClient();
const startConsultation = async (callId: string | undefined) => {
  if (!client) return; // Stream client not ready

  if (!callId) {
    toast.error("Call ID not available. Please try again later.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const authToken = localStorage.getItem("authToken"); // ✅ get token

  try {
    const res = await fetch(`${API_BASE_URL}/api/stream/token?callId=${callId}`, {
      headers: {
        "x-user-id": user._id,
        "Authorization": `Bearer ${authToken}`, // ✅ send token
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!data.token) {
      toast.error("Failed to get Stream token.");
      return;
    }

    localStorage.setItem("streamToken", data.token);

    navigate(`/call/${callId}`);
  } catch (err) {
    console.error("Error starting consultation:", err);
    toast.error("Something went wrong while starting the call.");
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
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-emerald-700">
                      {req.userInfo?.name || "Unknown User"}
                    </h4>
                    <p className="text-xs text-gray-500">{req.userInfo?.email}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="flex flex-wrap gap-x-4 mt-2 items-center text-xs text-gray-700">
                  {/* Editable Time */}
                  {req.time && (
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={req.time}
                        disabled={req.status !== "Pending"} // ⛔ Disable if not pending
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
                            const token = localStorage.getItem("authToken");
                            const res = await fetch(
                              `${API_BASE_URL}/api/consultation/requests/${req._id}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ time: newTime }),
                              }
                            );
                            const data = await res.json();
                            if (res.ok) toast.success("Time updated successfully");
                            else toast.error(data.error || "Failed to update time");
                          } catch {
                            toast.error("Server error");
                          }
                        }}
                        className={`border rounded-md px-2 py-0.5 text-xs transition ${req.status === "Pending"
                          ? "border-emerald-300 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          }`}
                      />
                    </div>
                  )}

                  {/* Mode (non-clickable badge) */}
                  <div className="flex items-center gap-1">
                    {req.mode === "Video" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-medium cursor-default select-none">
                        <Video size={13} />
                        Video
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-medium cursor-default select-none">
                        <MessageCircle size={13} />
                        Chat
                      </span>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="truncate max-w-[180px] text-gray-600">
                    {req.reason || "N/A"}
                  </div>
                </div>

                {/* Status & Date */}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${req.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {req.status || "Pending"}
                  </span>
                  {req.createdAt && (
                    <span>{dayjs(req.createdAt).format("MMM D, YYYY")}</span>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex gap-2">
                {req.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(req._id, req?.time, "Approved")}
                      className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req._id, req?.time, "Rejected")}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </>
                ) :
                  req.status === "Approved" && req.mode === "Chat" ? (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setOpenModal("chat");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageCircle size={13} className="inline mr-1" />
                      Chat
                    </button>
                  ) : req.status === "Approved" && req.mode === "Video" ? (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setOpenModal("video");
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition"
                    >
                      <Video size={13} className="inline mr-1" />
                      Video
                    </button>
                  ) : null}

              </div>
            </div>
          ))}
        </div>



      )}



      {/* Chat Modal */}
      {openModal === "chat" && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] flex flex-col">
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">
              Chat Consultation
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Chat with <span className="font-medium">{selectedRequest?.userInfo?.name}</span>
            </p>

            {/* CHAT AREA */}
            <div className="border rounded-md h-52 p-2 overflow-y-auto text-sm text-gray-700 flex flex-col gap-2">
              {selectedRequest?.chat?.length > 0 ? (
                selectedRequest.chat.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md max-w-[80%] ${msg.type === "doctor"
                      ? "bg-emerald-100 self-end text-right"
                      : "bg-gray-100 self-start"
                      }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-[10px] text-gray-500 block mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No messages yet...</p>
              )}
            </div>

            {/* INPUT */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message..."
                className="border rounded-md px-2 py-1 w-full text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Send
              </button>
            </div>

            <button
              onClick={() => setOpenModal(null)}
              className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Video Modal */}
      {openModal === "video" && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Video Consultation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Video call with <span className="font-medium">{selectedRequest?.userInfo?.name}</span>
            </p>

            {/* Example Video Link */}

            <button onClick={() => startConsultation(selectedRequest?.videoCallId)}>
              Join Call
            </button>
           

            {/* Example Timer Display */}
            <div className="mb-4 text-sm text-gray-700">
              <p>Status: <span className="font-medium text-emerald-600">Now</span></p>
              <p>Time Left: <span className="font-medium">15 mins</span></p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setOpenModal(null)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default DocterRequests;
