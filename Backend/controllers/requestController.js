import RequestModel from "../models/RequestModel.js";
import UserModel from "../models/user.js";

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
    const userId = req.user._id;

    const requests = await RequestModel.find({ userId })
      .populate("nutritionistId", "name email qualifications profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (err) {
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
