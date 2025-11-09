import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
  CallControls,
} from "@stream-io/video-react-sdk";
import "./style.css";
import { CleanLayout } from "../components/VideoLayouts";
import { useAuthContext } from "../authContext";

export default function UserCallPage() {
  const { callId } = useParams();
  const { user } = useAuthContext();
  const client = useStreamVideoClient();

  const [token, setToken] = useState<string | null>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!callId || !user?._id) return;

    const fetchToken = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      const res = await fetch(`/api/stream/token?callId=${callId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setToken(data.token);
    };

    fetchToken();
  }, [callId, user]);

  useEffect(() => {
    if (!token || !client || !callId) return;

    const joinedCall = client.call("default", callId);
    setCall(joinedCall);

    joinedCall.join({ token }).catch(console.error);

    return () => {
      joinedCall.leave().catch(console.error);
    };
  }, [token, client, callId]);

  if (!client || !token || !call) return <p>Loading call...</p>;

  return (
   <StreamTheme>
  <StreamCall call={call}>
    <div style={{ width:'100px' ,height: "50vh", display: "flex", flexDirection: "column" , backgroundColor: "#000"}}>
      <CleanLayout />
      <CallControls />
    </div>
  </StreamCall>
</StreamTheme>
  );
}
