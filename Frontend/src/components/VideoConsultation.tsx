'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../authContext';

import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import VideoConsultationRoom from './VideoConsultationRoom';
import { Button } from './ui/button';
import { Video, Phone, Clipboard, X, Briefcase } from 'lucide-react';
import EmeraldLoader from '../components/loader';



export default function VideoConsultation({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthContext();
  // ✅ Check if the user's medical profile is complete
const isProfileComplete = (user) => {
  return (
    user?.medical_conditions &&
    user?.height &&
    user?.weight &&
    user?.age
  );
};

  const client = useStreamVideoClient();
const [loading, setLoading] = useState(false);

  const [call, setCall] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const [requestTime, setRequestTime] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [consultationMode, setConsultationMode] = useState('Video'); // AI suggested


  let [nutritionists, setNutritionists] = useState<any[]>([]);

  useEffect(() => {
    const fetchNutritionists = async () => {
    try {
      setLoading(true); // start loader
      
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("You must be logged in to fetch nutritionists.");
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL; // ✅ from .env

        const res = await fetch(`${baseUrl}/get-docter-list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            
          },
        });

        if (res.ok) {
          const data = await res.json();
          setNutritionists(data?.data || []);
        } else {
          console.error('Failed to fetch nutritionists');
        }
      } catch (error) {
        console.error('Error fetching nutritionists:', error);
      }
      finally {
  setLoading(false);
}
    };

    fetchNutritionists();
  }, []);

  const startConsultation = async () => {
    if (!client || !user) return;
    try {
      const newCall = client.call('default', `consultation-${user._id}-${Date.now()}`);
      await newCall.getOrCreate({
        data: { starts_at: new Date().toISOString(), custom: { type: 'nutrition-consultation', title: 'Nutrition Consultation' } },
      });
      await newCall.join();
      setCall(newCall);
      setShowModal(true);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const joinConsultation = async () => {
    if (!client || !joinLink) return;
    let id = joinLink.trim();
    try {
      const parts = id.split('/');
      id = parts[parts.length - 1];
      const callInstance = client.call('default', id);
      await callInstance.join();
      setCall(callInstance);
      setShowModal(true);
    } catch (error) {
      console.error('Error joining consultation:', error);
    }
  };

  const handleEnd = async () => {
    if (!call) return;
    try { await call.leave(); } catch { }
    setCall(null);
    setShowModal(false);
    onClose?.();
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/consultation/${call.id}`;
    navigator.clipboard.writeText(url);
  };

  const openRequestModal = (nutritionist: any) => {
    setSelectedNutritionist(nutritionist);
    setRequestTime('');
    setRequestReason('');
    setConsultationMode('Video');
    setRequestModal(true);
  };

  const sendRequest = async () => {
    
    if (!selectedNutritionist) return;
    if (!requestTime || !requestReason) {
      alert('Please enter time and reason for consultation');
      return;
    }

    try {
    setLoading(true); // 🟢 show loader
      const token = localStorage.getItem('authToken'); // or wherever you store it after login
      if (!token) {
        alert("You must be logged in to send a request.");
        return;
      }

      const baseURL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${baseURL}/consultation/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ← Add the JWT token here
        },
        body: JSON.stringify({
          nutritionistId: selectedNutritionist._id,
          time: requestTime,
          reason: requestReason,
          mode: consultationMode
        }),
      });

      if (res.ok) {
        alert('Request sent successfully!');
        setRequestModal(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to send request');
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (user?.role === 'nutritionist') {
      setPendingRequests([
        { _id: 'r1', userName: 'Mariam Fatima', userId: 'u1', time: '10:00 AM', reason: 'Weight Loss', mode: 'Video' }
      ]);
    }
  }, [user]);

  const approveRequest = async (requestId: string) => { await startConsultation(); setPendingRequests(pendingRequests.filter(r => r._id !== requestId)); };
  const denyRequest = async (requestId: string) => { setPendingRequests(pendingRequests.filter(r => r._id !== requestId)); };

  // ---------------- RENDER ----------------

  if (call) {
    const inviteUrl = `${window.location.origin}/consultation/${call.id}`;
    return (
      <>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
              <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
              <h2 className="text-lg font-semibold mb-4 text-emerald-600">Invite Someone</h2>
              <input type="text" readOnly value={inviteUrl} className="w-full border rounded px-3 py-2 mb-4" onFocus={e => e.currentTarget.select()} />
              <div className="flex justify-end gap-2">
                <Button onClick={copyInviteLink} variant="outline" size="sm"><Clipboard className="h-4 w-4 mr-1" /> Copy Link</Button>
                <Button onClick={() => setShowModal(false)} size="sm">Close</Button>
              </div>
            </div>
          </div>
        )}
        <div className="fixed inset-0 z-40">
          <StreamCall call={call}>
            <VideoConsultationRoom onClose={handleEnd} />
          </StreamCall>
        </div>
      </>
    );
  }
  const baseUrl = import.meta.env.VITE_API_URL;
  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h3 className="text-xl font-semibold mb-4">Video Consultation</h3>

     {/* Nutritionist Cards */}
{loading ? (
  <div className="flex justify-center items-center h-[50vh]">
    <EmeraldLoader />
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
    {nutritionists.map((n) => (
      <div
        key={n._id}
        onClick={() => openRequestModal(n)}
        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-transparent hover:border-emerald-200"
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={`${baseUrl}${n.profileImage}`}
              alt={n.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm"
            />
          </div>

          <h4 className="text-lg font-semibold text-gray-800 mt-3">{n.name}</h4>
          <p className="text-sm text-gray-500">{n.qualifications}</p>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-emerald-700 font-medium">
            <Briefcase size={14} />
            <span>
              {n.yearsOfExperience} {n.yearsOfExperience === 1 ? 'Year' : 'Years'} Experience
            </span>
          </div>

          {n.certifications?.length > 0 && (
            <div className="flex flex-wrap justify-center mt-3 gap-2">
              {n.certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}

          <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-full hover:bg-emerald-700 transition">
            Consult me
          </button>
        </div>
      </div>
    ))}
  </div>
)}



      {/* Request Modal */}
      {requestModal && selectedNutritionist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh] transition-all">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-emerald-700 transition"
              onClick={() => setRequestModal(false)}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header / Doctor Info */}
            <div className="bg-emerald-50 rounded-xl p-5 mb-5 border border-emerald-100">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`${baseUrl}${selectedNutritionist.profileImage}`}
                  alt={selectedNutritionist.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div>
                  <h2 className="text-xl font-semibold text-emerald-800">
                    {selectedNutritionist.name}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedNutritionist.qualifications}</p>
                  <p className="text-xs text-gray-500">
                    {selectedNutritionist.yearsOfExperience}{" "}
                    {selectedNutritionist.yearsOfExperience === 1 ? "Year" : "Years"} Experience
                  </p>
                </div>
              </div>
              <hr className="border-t-4 border-[#059669] my-4 rounded-full" />


              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold text-emerald-700">Specialization:</span>{" "}
                  {selectedNutritionist.specialization || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-700">Certifications:</span>{" "}
                  {selectedNutritionist.certifications?.join(", ") || "None"}
                </p>

                <p>
                  <span className="font-semibold text-emerald-700">Email:</span>{" "}
                  {selectedNutritionist.email || "N/A"}
                </p>

              </div>

              {selectedNutritionist.bio && (
                <p className="text-sm text-gray-600 mt-3 italic leading-relaxed border-t border-emerald-100 pt-3">
                  “{selectedNutritionist.bio}”
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={requestTime}
                  onChange={(e) => setRequestTime(e.target.value)}
                  className="w-full border border-gray-300 focus:border-emerald-400 focus:ring-emerald-300 rounded-lg px-3 py-2 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Consultation
                </label>
                <textarea
                  placeholder="Describe your reason..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full border border-gray-300 focus:border-emerald-400 focus:ring-emerald-300 rounded-lg px-3 py-2 text-sm h-24 outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Mode
                </label>
                <select
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value)}
                  className="w-full border border-gray-300 focus:border-emerald-400 focus:ring-emerald-300 rounded-lg px-3 py-2 text-sm outline-none transition"
                >
                  <option>Video</option>
                  <option>Chat</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={sendRequest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-full shadow-sm transition"
              >
                Send Request
              </button>
              <button
                onClick={() => setRequestModal(false)}
                className="border border-gray-300 hover:border-gray-400 text-gray-600 text-sm font-medium px-5 py-2 rounded-full transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Pending Requests */}
      {user?.role === 'nutritionist' && pendingRequests.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Pending Requests</h4>
          {pendingRequests.map(req => (
            <div key={req._id} className="p-4 bg-white shadow rounded mb-2">
              <p>User: {req.userName}</p>
              <p>Time: {req.time}</p>
              <p>Reason: {req.reason}</p>
              <p>Mode: {req.mode}</p>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => approveRequest(req._id)}>Approve</Button>
                <Button onClick={() => denyRequest(req._id)} variant="outline">Deny</Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
