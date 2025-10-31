import VideoConsultation from './VideoConsultation';
import MyRequests from './MyRequests';
import { useState, useRef } from 'react';

export default function ParentComponent() {
  const [activeTab, setActiveTab] = useState<'video' | 'myRequests'>('video');
  const myRequestsRef = useRef<any>(null);

  const fetchRequests = () => {
    myRequestsRef.current?.fetchRequests?.();
  };

  const handleRequestSent = (request: any) => {
    fetchRequests();
  };

  return (
    <div>
      {activeTab === 'video' && (
        <VideoConsultation
          fetchRequests={fetchRequests}       // ✅ pass function
          setActiveTab={setActiveTab}        // ✅ pass function
          onRequestSent={handleRequestSent}  // ✅ pass function
        />
      )}

      {activeTab === 'myRequests' && (
        <MyRequests ref={myRequestsRef} />
      )}
    </div>
  );
}
