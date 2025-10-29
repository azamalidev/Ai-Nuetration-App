'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  StreamCall,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import { Users, PhoneOff, Video as VideoIcon, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { useChatContext } from 'stream-chat-react';
import { useAuthContext } from '../authContext'; // ← Make sure this path is correct

interface VideoConsultationRoomProps {
  callId: string;
  onClose: () => void;
}

export default function VideoConsultationRoom({
  callId,
  onClose,
}: VideoConsultationRoomProps) {
  const call = useCall();
  const { client: chatClient } = useChatContext();
  const { user } = useAuthContext(); // get logged-in user

  const {
    useCallCallingState,
    useParticipants,
    useMicrophoneState,
    useCameraState,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const participants = useParticipants();
  const { microphone, status: micStatus } = useMicrophoneState();
  const { camera, isEnabled: camEnabled } = useCameraState();

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // ---------------- JOIN CALL ----------------
  useEffect(() => {
    async function initCall() {
      if (!call || !user?._id) return;

      try {
        // Fetch call & chat token from backend
        const response = await fetch(`/api/getCallToken?callId=${callId}`, {
          headers: {
            'x-user-id': user._id, // send logged-in user ID
          },
        });

        const data = await response.json();

        if (!data.token || !data.chatToken) {
          console.error("No token returned from server");
          return;
        }

        // Join the video call
        await call.join({ token: data.token });

        // Connect to chat
        await chatClient.connectUser({ id: user._id }, data.chatToken);

      } catch (err) {
        console.error("Failed to join call:", err);
      }
    }

    initCall();
  }, [call, callId, user, chatClient]);

  const toggleParticipants = useCallback(() => setShowParticipants(p => !p), []);
  const toggleChat = useCallback(() => setShowChat(p => !p), []);
  const toggleMic = useCallback(() => microphone?.toggle(), [microphone]);
  const toggleCam = useCallback(() => camera?.toggle(), [camera]);
  const endCall = useCallback(async () => { await call?.leave(); onClose(); }, [call, onClose]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-lg">Joining consultation…</p>
        </div>
      </div>
    );
  }

  return (
    <StreamCall call={call!}>
      {/* Video panel */}
      <section className="relative pt-20 h-screen w-full overflow-hidden bg-gray-900 text-white">
        <div className="flex h-full w-full items-center justify-center">
          {participants.length === 2 ? (
            <div className="flex w-full h-full">
              {participants.map(p => (
                <div key={p.id} className="flex-1 h-full">
                  <ParticipantView participant={p} className="w-full h-full" />
                </div>
              ))}
            </div>
          ) : (
            participants.length === 1
              ? <SpeakerLayout participantsBarPosition="top" />
              : <PaginatedGridLayout />
          )}
        </div>

        {/* Side panels */}
        {showParticipants && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gray-800">
            <CallParticipantsList onClose={toggleParticipants} />
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around p-4 bg-black bg-opacity-50">
          <div className="relative flex items-center gap-3">
            <Button onClick={toggleParticipants} variant="outline" size="sm">
              <Users className="h-4 w-4 mr-1" /> {participants.length}
            </Button>
            <Button onClick={toggleMic} variant="outline" size="sm">
              {micStatus === 'disabled' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={toggleCam} variant="outline" size="sm">
              {camEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <CallControls />
            <Button onClick={endCall} variant="destructive" size="sm">
              <PhoneOff className="h-4 w-4 mr-1" /> End Call
            </Button>
          </div>
        </div>
      </section>
    </StreamCall>
  );
}
