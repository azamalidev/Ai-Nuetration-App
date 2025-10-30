import React, { useEffect, useState } from "react";

interface MyRequestsProps {
  refresh?: boolean; // optional prop to trigger refetch
}

const MyRequests = ({ refresh }: MyRequestsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null); // For clicked request
  const baseURL = "http://localhost:5000/api";

  // ✅ Dummy requests
  const dummyRequests = [
    {
      _id: "1",
      nutritionistId: { name: "Mariam", email: "mariam1123@gmail.com", qualifications: "Nutritionist" },
      time: "10:00 AM",
      reason: "Weight loss consultation",
      mode: "Video",
      status: "Pending",
      notes: "N/A"
    },
  //  {
  //    _id: "2",
  //    nutritionistId: { name: "Dr. Ali Raza", email: "ali@example.com", qualifications: "Dietician" },
  //    time: "11:30 AM",
  //    reason: "Diet plan guidance",
   //   mode: "Chat",
   //   status: "Approved",
 //     notes: "Follow-up next week"
//    },
   // {
   //   _id: "3",
   //   nutritionistId: { name: "Dr. Maria Jamil", email: "maria@example.com", qualifications: "Nutritionist" },
    //  time: "2:00 PM",
  //    reason: "General health check",
   //   mode: "Video",
  //    status: "Rejected",
  //    notes: "Reschedule required"
 //   },
 //   {
 //     _id: "4",
  //    nutritionistId: { name: "Dr. Ahmed Tariq", email: "ahmed@example.com", qualifications: "Dietician" },
  //    time: "4:00 PM",
  //    reason: "Protein intake consultation",
 //     mode: "Video",
 //     status: "Pending",
  //    notes: "N/A"
 ////   },
 //   {
  //    _id: "5",
  //    nutritionistId: { name: "Dr. Sana Iqbal", email: "sana@example.com", qualifications: "Nutritionist" },
   //   time: "5:30 PM",
////      reason: "Weight gain guidance",
 //     mode: "Chat",
 //     status: "Pending",
 //     notes: "N/A"
   // }
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setRequests(dummyRequests); // fallback to dummy if not logged in
        return;
      }

      try {
        const res = await fetch(`${baseURL}/consultation/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRequests([...dummyRequests, ...data.requests]); // combine dummy + backend
        } else {
          setRequests(dummyRequests); // fallback if API fails
        }
      } catch (err) {
        console.error(err);
        setRequests(dummyRequests);
      }
    };

    fetchRequests();
  }, [refresh]); // ✅ refresh triggers refetch

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-emerald-700">My Requests</h3>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="border border-emerald-100 p-4 rounded-lg shadow-sm bg-emerald-50 cursor-pointer"
              onClick={() => {
                setSelectedRequest(req); // store clicked request
                setModalOpen(true);      // open modal
              }}
            >
              <h4 className="font-semibold text-emerald-700">
                {req.nutritionistId?.name || "Unknown Nutritionist"}
              </h4>
              <p className="text-sm text-gray-600">Time: {req.time}</p>
              <p className="text-sm text-gray-600">Reason: {req.reason}</p>
              <p className="text-sm text-gray-600">Mode: {req.mode}</p>
              <p
                className={`text-sm font-medium mt-1 ${
                  req.status === "Pending"
                    ? "text-yellow-600"
                    : req.status === "Approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Status: {req.status}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal or detail section */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold"
            >
              X
            </button>
            <h4 className="font-semibold text-emerald-700 mb-2">Request Details</h4>
            <p><strong>Nutritionist:</strong> {selectedRequest.nutritionistId?.name || "N/A"}</p>
            <p><strong>Email:</strong> {selectedRequest.nutritionistId?.email || "N/A"}</p>
            <p><strong>Qualifications:</strong> {selectedRequest.nutritionistId?.qualifications || "N/A"}</p>
            <p><strong>Time:</strong> {selectedRequest.time}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            <p><strong>Mode:</strong> {selectedRequest.mode}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Additional Notes:</strong> {selectedRequest.notes || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
