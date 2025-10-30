// ParentComponent.tsx
import { useState, useEffect } from "react";
import VideoConsultation from "./VideoConsultation";
import MyRequests from "./MyRequests";

const ParentComponent = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(`http://localhost:5000/api/consultation/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setRequests(data.requests);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestSent = (newRequest: any) => {
    // Add the new request to the existing list immediately
    setRequests(prev => [newRequest, ...prev]);
  };

  return (
    <div>
      <VideoConsultation onRequestSent={handleRequestSent} />
      <MyRequests requests={requests} />
    </div>
  );
};

export default ParentComponent;
