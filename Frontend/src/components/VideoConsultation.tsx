


// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuthContext } from '../authContext';
// import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
// import VideoConsultationRoom from './VideoConsultationRoom';
// import { Button } from './ui/button';
// import { Video, Phone, Clipboard, X } from 'lucide-react';

// export default function VideoConsultation({ onClose }) {
//   const { user } = useAuthContext();
//   const client = useStreamVideoClient();

//   const [call, setCall] = useState<any>(null);
//   const [showModal, setShowModal] = useState(false);

//   const startConsultation = async () => {
//     if (!client || !user) return;
//     try {
//       const newCall = client.call(
//         'default',
//         `consultation-${user._id}-${Date.now()}`
//       );
//       await newCall.getOrCreate({
//         data: {
//           starts_at: new Date().toISOString(),
//           custom: {
//             type: 'nutrition-consultation',
//             title: 'Nutrition Consultation',
//           },
//         },
//       });
//       await newCall.join();
//       setCall(newCall);
//       setShowModal(true);              // ← show the invite modal
//     } catch (error) {
//       console.error('Error starting consultation:', error);
//     }
//   };

//   const handleEnd = async () => {
//     if (!call) return;
//     try {
//       await call.leave();
//     } catch { }
//     setCall(null);
//     onClose?.();
//   };

//   // When you click “Copy Invite” inside the modal
//   const copyInviteLink = () => {
//     const url = `${window.location.origin}/consultation/${call!.id}`;
//     navigator.clipboard.writeText(url);
//     // Optionally show a toast…
//   };

//   // Render the modal + call UI once "call" is set
//   if (call) {
//     const inviteUrl = `${window.location.origin}/consultation/${call.id}`;

//     return (
//       <>
//         {/* 1) THE MODAL AT z-50 */}
//         {showModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//             <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
//               <button
//                 className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
//                 onClick={() => setShowModal(false)}
//               >
//                 <X className="h-5 w-5" />
//               </button>
//               <h2 className="text-lg font-semibold mb-4">Invite Someone</h2>
//               <input
//                 type="text"
//                 readOnly
//                 value={inviteUrl}
//                 className="w-full border rounded px-3 py-2 mb-4"
//                 onFocus={(e) => e.currentTarget.select()}
//               />
//               <div className="flex justify-end gap-2">
//                 <Button onClick={copyInviteLink} variant="outline" size="sm">
//                   <Clipboard className="h-4 w-4 mr-1" />
//                   Copy Link
//                 </Button>
//                 <Button onClick={() => setShowModal(false)} size="sm">
//                   Close
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 2) THE CALL UI AT z-40 */}
//         <div className="fixed inset-0 z-40">
//           <StreamCall call={call}>
//             <VideoConsultationRoom onClose={handleEnd} />
//           </StreamCall>
//         </div>
//       </>
//     );
//   }


//   // Before call: show start button
//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">Video Consultation</h3>
//       <Button
//         onClick={startConsultation}
//         className="w-full bg-emerald-600 hover:bg-emerald-700"
//       >
//         <Phone className="h-4 w-4 mr-2" />
//         Start New Consultation
//       </Button>
//     </div>
//   );
// }




'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../authContext';
import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import VideoConsultationRoom from './VideoConsultationRoom';
import { Button } from './ui/button';
import { Video, Phone, Clipboard, X } from 'lucide-react';

export default function VideoConsultation({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthContext();
  const client = useStreamVideoClient();

  // The active Call instance
  const [call, setCall] = useState<any>(null);
  // Show/hide invite modal
  const [showModal, setShowModal] = useState(false);
  // Input for joining existing call
  const [joinLink, setJoinLink] = useState('');

  // Start a new consultation
  const startConsultation = async () => {
    if (!client || !user) return;
    try {
      const newCall = client.call(
        'default',
        `consultation-${user._id}-${Date.now()}`
      );
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            type: 'nutrition-consultation',
            title: 'Nutrition Consultation',
          },
        },
      });
      await newCall.join();
      setCall(newCall);
      setShowModal(true);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  // Join an existing consultation by ID or full URL
  const joinConsultation = async () => {
    if (!client || !joinLink) return;
    // Extract the callId from the link or raw ID
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

  // End and leave the call
  const handleEnd = async () => {
    if (!call) return;
    try { await call.leave(); } catch { };
    setCall(null);
    setShowModal(false);
    onClose?.();
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    const url = `${window.location.origin}/consultation/${call.id}`;
    navigator.clipboard.writeText(url);
  };

  // If in a call, show modal & call UI
  if (call) {
    const inviteUrl = `${window.location.origin}/consultation/${call.id}`;
    return (
      <>
        {/* Invite Link Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Invite Someone</h2>
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full border rounded px-3 py-2 mb-4"
                onFocus={e => e.currentTarget.select()}
              />
              <div className="flex justify-end gap-2">
                <Button onClick={copyInviteLink} variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-1" /> Copy Link
                </Button>
                <Button onClick={() => setShowModal(false)} size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video call UI */}
        <div className="fixed inset-0 z-40">
          <StreamCall call={call}>
            <VideoConsultationRoom onClose={handleEnd} />
          </StreamCall>
        </div>
      </>
    );
  }

  // Before joining or starting: show start + join input
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Video Consultation</h3>
      <div className="space-y-4">
        <div className="text-center">
          <Video className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Connect with nutrition experts for personalized advice and guidance
          </p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={startConsultation}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Phone className="h-4 w-4 mr-2" /> Start New Consultation
          </Button>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Paste invite link or ID"
              value={joinLink}
              onChange={e => setJoinLink(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              onClick={joinConsultation}
              disabled={!joinLink}
              variant="outline"
            >
              Join
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500 text-center">
          <p>• Free consultations available</p>
          <p>• Expert nutritionists on standby</p>
          <p>• Screen sharing and chat available</p>
        </div>
      </div>
    </div>
  );
}
