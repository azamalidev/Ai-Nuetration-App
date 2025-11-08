import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import { useAuthContext } from '../authContext';

export default function CallPage() {
  const { callId } = useParams();
  const { user } = useAuthContext(); // logged-in user
  const client = useStreamVideoClient();

  const [token, setToken] = useState<string | null>(null);
  const [call, setCall] = useState<any>(null);

useEffect(() => {
  if (!callId || !user?._id) {
    console.error("Missing callId or user._id. Cannot fetch token.");
    return;
  }

  const fetchStreamToken = async () => {
    try {
      const authToken = localStorage.getItem("authToken"); // ✅ get auth token

      if (!authToken) {
        console.error("No auth token found in localStorage.");
        return;
      }

      const res = await fetch(`/api/stream/token?callId=${callId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // ✅ send it
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to get Stream token, status:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Stream token response:", data);

      if (!data.token) {
        console.error("No token returned from backend", data);
        return;
      }

      setToken(data.token);
    } catch (err) {
      console.error("Failed to fetch Stream token:", err);
    }
  };

  fetchStreamToken();
}, [callId, user]);


  useEffect(() => {
    if (!token || !client || !callId) return;

    const newCall = client.call("default", callId);
    setCall(newCall);

    newCall.join({ token }).catch(console.error);

    return () => {
      newCall.leave().catch(console.error);
    };
  }, [token, client, callId]);

  if (!client || !callId || !token || !call) {
    return <p>Loading call...</p>;
  }

  return (
    <StreamTheme>
      <StreamCall call={call}>
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <SpeakerLayout style={{ flex: 1 }} />
          <CallControls />
        </div>
      </StreamCall>
    </StreamTheme>
  );
}
