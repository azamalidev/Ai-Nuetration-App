import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Users,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  MessageSquare,
} from "lucide-react";
import { useAuthContext } from "../authContext";
import "./style.css";

export default function UserCallPage() {
  const { callId } = useParams();
  const { user } = useAuthContext();
  const client = useStreamVideoClient();

  const [token, setToken] = useState<string | null>(null);
  const [call, setCall] = useState<any>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // ---------------- FETCH TOKEN ----------------
  useEffect(() => {
    if (!callId || !user?._id) return;

    const fetchToken = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      try {
        const res = await fetch(`/api/stream/token?callId=${callId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        console.error(err);
      }
    };

    fetchToken();
  }, [callId, user]);

  // ---------------- CREATE AND JOIN CALL ----------------
  useEffect(() => {
    if (!token || !client || !callId) return;

    const newCall = client.call("default", callId);
    setCall(newCall);

    newCall
      .getOrCreate()
      .then(() => newCall.join({ token }))
      .catch(console.error);

    return () => {
      newCall.leave().catch(console.error);
    };
  }, [token, client, callId]);

  const toggleParticipants = useCallback(() => setShowParticipants((p) => !p), []);
  const toggleChat = useCallback(() => setShowChat((c) => !c), []);
  const endCall = useCallback(async () => await call?.leave(), [call]);

  if (!call || !token) return <p>Loading call...</p>;

  return (
    <StreamTheme>
      <StreamCall call={call}>
        <VideoCallUI
          call={call}
          showParticipants={showParticipants}
          toggleParticipants={toggleParticipants}
          showChat={showChat}
          toggleChat={toggleChat}
          endCall={endCall}
          userEmail={user?.email}
        />
      </StreamCall>
    </StreamTheme>
  );
}

// ---------------- VIDEO CALL UI ----------------
function VideoCallUI({
  call,
  showParticipants,
  toggleParticipants,
  showChat,
  toggleChat,
  endCall,
  userEmail,
}) {
  const { useParticipants, useMicrophoneState, useCameraState } = useCallStateHooks();
  const participants = useParticipants();
  const { microphone, status: micStatus } = useMicrophoneState();
  const { camera, isEnabled: camEnabled } = useCameraState();

  const toggleMic = () => microphone?.toggle();
  const toggleCam = () => camera?.toggle();

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages((prev) => [...prev, { sender: userEmail || "User", text: input }]);
    setInput("");
  };

  if (!call) return <p>Loading call…</p>;

  return (
    <div
      className="meet-container"
      style={{
        position: "relative",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* ---------------- EMAIL TOP-RIGHT ---------------- */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 20,
          color: "#fff",
          background: "rgba(0,0,0,0.5)",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 20,
        }}
      >
        {userEmail || "User"}
      </div>

      {/* ---------------- FULLSCREEN VIDEO AREA ---------------- */}
      <div
        className="video-area"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {participants.length > 0 ? (
          participants
            .filter((p) => !p.isLocalParticipant)
            .map((p) => (
              <ParticipantView
                key={p.sessionId}
                participant={p}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ))
        ) : (
          <p style={{ color: "#fff" }}>Waiting for participant...</p>
        )}

        {/* Local participant preview */}
        {participants
          .filter((p) => p.isLocalParticipant)
          .map((p) => (
            <div
              key={p.sessionId}
              style={{
                position: "absolute",
                bottom: "90px",
                right: "20px",
                width: "220px",
                height: "150px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #fff",
              }}
            >
              <ParticipantView
                participant={p}
                showParticipantDetails={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
      </div>

      {/* ---------------- CHAT PANEL ---------------- */}
      {showChat && (
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 90,
            width: 300,
            height: 400,
            background: "#1f2937",
            borderRadius: 8,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 30,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              color: "#fff",
              padding: "4px",
              borderBottom: "1px solid #374151",
            }}
          >
            {messages.length === 0 ? (
              <p>No messages yet...</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
            <input
              type="text"
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                borderRadius: "6px",
                padding: "6px",
                border: "none",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "#10b981",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ---------------- FOOTER CONTROLS ---------------- */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0.5rem 0",
          gap: "1rem",
          background: "#111827",
          borderTop: "1px solid #374151",
          zIndex: 40,
        }}
      >
        <ControlButton active={micStatus !== "disabled"} onClick={toggleMic}>
          {micStatus === "disabled" ? <MicOff /> : <Mic />}
        </ControlButton>

        <ControlButton active={camEnabled} onClick={toggleCam}>
          {camEnabled ? <VideoIcon /> : <VideoOff />}
        </ControlButton>

        

        

        <ControlButton active={showChat} onClick={toggleChat}>
          <MessageSquare />
        </ControlButton>

        <ControlButton active={false} onClick={endCall} destructive>
          <PhoneOff />
        </ControlButton>
      </div>
    </div>
  );
}

// ---------------- CONTROL BUTTON ----------------
function ControlButton({
  children,
  onClick,
  active,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: destructive ? "#dc2626" : active ? "#10b981" : "#6b7280",
        color: "#fff",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      {children}
    </button>
  );
}
