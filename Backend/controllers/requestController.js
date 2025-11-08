import RequestModel from "../models/RequestModel.js";
import mongoose from "mongoose"
import { StreamClient } from "@stream-io/node-sdk";

// Stream.io setup
const serverClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_SECRET_KEY
);
// ✅ Create Request
export const createRequest = async (req, res) => {
  try {
    const { nutritionistId, time, reason, mode } = req.body;
    const userId = req.user._id; // from auth middleware

    const request = await RequestModel.create({
      userId,
      nutritionistId,
      time,
      reason,
      mode,
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params; // /request/:id
    const { status } = req.query;

    // 1️⃣ Update request
    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // 2️⃣ Run only if status is Approved
    if (status === "Approved") {
      const { mode, nutritionistId, userId } = updatedRequest;

      // 🟩 CHAT Mode
      if (mode === "Chat") {
        updatedRequest.chat = [
          {
            type: "doctor",
            message: "Hello! Your consultation request has been approved. How can I assist you today?",
            timestamp: new Date(),
          },
        ];
        await updatedRequest.save();
      }

      // 🟦 VIDEO Mode
      else if (mode === "Video") {
        const nutritionistIdStr = nutritionistId.toString();
        const userIdStr = userId.toString();

        const callId = `call_${updatedRequest._id}`;


        // Save call id
        updatedRequest.videoCallId = callId;
        await updatedRequest.save();

        const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
        const nutritionistToken = serverClient.createToken(nutritionistIdStr, expiresIn);
        const userToken = serverClient.createToken(userIdStr, expiresIn);


        return res.status(200).json({
          success: true,
          request: updatedRequest,
          stream: {
            callId,
            nutritionist: { userId: nutritionistIdStr, token: nutritionistToken },
            patient: { userId: userIdStr, token: userToken },
          },
        });
      }

    }

    // ✅ Final success response
    res.status(200).json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error("❌ Error updating request:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const callId = req.query.callId;

    if (!callId) return res.status(400).json({ success: false, message: "Call ID required" });

    const token = serverClient.video.createCallToken({
      call: { type: "default", id: callId },
      user: { id: userId },
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const updateRequestChat = async (req, res) => {
  try {
    const { id } = req.params;     // request ID
    const { type, message } = req.body; // from frontend

    if (!message || !type) {
      return res.status(400).json({ success: false, msg: "Message and type are required" });
    }

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      {
        $push: {
          chat: {
            type,
            message,
            timestamp: new Date()
          }
        }
      },
      { new: true } // return updated doc
    );

    res.status(200).json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error("❌ Error updating request:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};




// ✅ Get requests by user (for “My Requests”)
export const getUserRequests = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const requests = await RequestModel.aggregate([
      // 1️⃣ Filter only this user's requests
      { $match: { userId } },

      // 2️⃣ Lookup nutritionist info from the User collection
      {
        $lookup: {
          from: "users", // collection name in MongoDB (usually lowercase plural)
          localField: "nutritionistId",
          foreignField: "_id",
          as: "nutritionistInfo",
        },
      },

      // 3️⃣ Unwind the array (since lookup returns an array)
      { $unwind: "$nutritionistInfo" },

      // 4️⃣ Sort by newest first
      { $sort: { createdAt: -1 } },

      // 5️⃣ Optionally pick only needed fields
      {
        $project: {
          _id: 1,
          time: 1,
          reason: 1,
          mode: 1,
          createdAt: 1,
          chat: 1,
          videoCallId: 1,
          status: 1,
          // Nutritionist details
          "nutritionistInfo._id": 1,
          "nutritionistInfo.name": 1,
          "nutritionistInfo.email": 1,
          "nutritionistInfo.qualifications": 1,
          "nutritionistInfo.profileImage": 1,
        },
      },
    ]);

    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get requests by user (for “My Requests”)
export const getDocterRequests = async (req, res) => {
  try {
    const nutritionistId = new mongoose.Types.ObjectId(req.user._id);

    const requests = await RequestModel.aggregate([
      {
        $match: { nutritionistId: new mongoose.Types.ObjectId(nutritionistId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          time: 1,
          reason: 1,
          mode: 1,
          createdAt: 1,
          chat: 1,
          videoCallId: 1,
          status: 1,
          "userInfo._id": 1,
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.qualifications": 1,
          "userInfo.profileImage": 1,
        },
      },
    ]);

    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Update status (for nutritionist)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const updated = await RequestModel.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, requests });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
