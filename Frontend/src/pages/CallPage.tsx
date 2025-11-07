import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";

export default function CallPage() {
  const { callId } = useParams();
  const client = useStreamVideoClient();

  console.log("CallPage callId:", callId, client);

  if (!client || !callId) return <p>Loading...</p>;

  const call = client.call("default", callId);

  useEffect(() => {
    call.join().catch(console.error); // ✅ Join call here
  }, [call]);

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
