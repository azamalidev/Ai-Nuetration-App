'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../authContext';
import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import VideoConsultationRoom from './VideoConsultationRoom';
import { Button } from './ui/button';
import { Video, Phone, Clipboard, X } from 'lucide-react';

const nutritionists = [
  {
    _id: '1',
    name: 'Dr. Ayesha Khan',
    specialty: 'Weight Loss',
    experience: '10 years',
    education: 'MBBS, Nutrition MSc',
    certifications: ['Certified Nutritionist', 'Weight Loss Specialist'],
    bio: 'Expert in holistic nutrition and personalized diet plans.',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    businessHours: 'Mon-Fri: 9AM - 5PM',
    offDays: 'Sat, Sun',
    languages: 'English, Urdu'
  },
  {
    _id: '2',
    name: 'Dr. Ali Raza',
    specialty: 'Diabetes Management',
    experience: '8 years',
    education: 'MBBS, Diabetes Nutrition Diploma',
    certifications: ['Certified Diabetes Educator'],
    bio: 'Focus on diabetes, metabolism, and healthy lifestyle guidance.',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    businessHours: 'Mon-Fri: 10AM - 6PM',
    offDays: 'Sat, Sun',
    languages: 'English, Urdu, Arabic'
  },
];

export default function VideoConsultation({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthContext();
  const client = useStreamVideoClient();

  const [call, setCall] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const [requestTime, setRequestTime] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [consultationMode, setConsultationMode] = useState('Video'); // AI suggested

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
    const token = localStorage.getItem('token'); // or wherever you store it after login
    if (!token) {
      alert("You must be logged in to send a request.");
      return;
    }

    const res = await fetch('http://localhost:50001/api/consultation/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ← Add the JWT token here
      },
      body: JSON.stringify({
        userId: user._id,
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h3 className="text-xl font-semibold mb-4">Video Consultation</h3>

      {/* Nutritionist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {nutritionists.map(n => (
          <div key={n._id} className="bg-white shadow rounded-lg cursor-pointer hover:shadow-lg transition transform hover:scale-105 hover:bg-emerald-50" onClick={() => openRequestModal(n)}>
            <div className="p-4 flex flex-col items-center">
              <img src={n.photo} alt={n.name} className="w-20 h-20 rounded-full mb-2 object-cover" />
              <h4 className="text-md font-semibold text-center">{n.name}</h4>
              <p className="text-sm text-gray-500 text-center">{n.specialty}</p>
              <p className="text-xs text-gray-400 text-center mt-1">{n.experience}</p>
              <div className="flex flex-wrap justify-center mt-2 gap-1">
                {n.certifications.map(cert => <span key={cert} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{cert}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request Modal */}
      {requestModal && selectedNutritionist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={() => setRequestModal(false)}><X className="h-5 w-5" /></button>

            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4 mb-2">
                <img src={selectedNutritionist.photo} alt={selectedNutritionist.name} className="w-24 h-24 rounded-full object-cover" />
                <div>
                  <h2 className="text-lg font-semibold text-emerald-800">{selectedNutritionist.name}</h2>
                  <p className="text-sm text-gray-600">{selectedNutritionist.specialty}</p>
                  <p className="text-xs text-gray-500">{selectedNutritionist.experience}</p>
                </div>
              </div>
              <p className="text-sm mb-1"><span className="font-semibold">Education:</span> {selectedNutritionist.education}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Certifications:</span> {selectedNutritionist.certifications.join(', ')}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Business Hours:</span> {selectedNutritionist.businessHours}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Off Days:</span> {selectedNutritionist.offDays}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Languages:</span> {selectedNutritionist.languages}</p>
              <p className="text-sm mb-3">{selectedNutritionist.bio}</p>
            </div>

            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <input type="time" value={requestTime} onChange={e => setRequestTime(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />

            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea placeholder="Your reason" value={requestReason} onChange={e => setRequestReason(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />

            <label className="block text-sm font-medium mb-1">Consultation Mode</label>
            <select value={consultationMode} onChange={e => setConsultationMode(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
              <option>Video</option>
              <option>Chat</option>
            </select>

            <div className="flex justify-end gap-2">
              <Button onClick={sendRequest} className="bg-emerald-600 hover:bg-emerald-700">Send Request</Button>
              <Button onClick={() => setRequestModal(false)} variant="outline">Cancel</Button>
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
