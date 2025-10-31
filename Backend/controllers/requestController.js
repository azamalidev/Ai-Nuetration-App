import RequestModel from "../models/RequestModel.js";
import UserModel from "../models/user.js";
import mongoose from "mongoose"
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
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const requests = await RequestModel.aggregate([
      // 1️⃣ Filter only this user's requests
      { $match: { userId } },

      // 2️⃣ Lookup nutritionist info from the User collection
      {
        $lookup: {
          from: "users", // collection name in MongoDB (usually lowercase plural)
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },

      // 3️⃣ Unwind the array (since lookup returns an array)
      { $unwind: "$userInfo" },

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
          status: 1,
          // Nutritionist details
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
