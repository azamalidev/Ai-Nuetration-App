import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nutritionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Video", "Chat"],
      default: "Video",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // 🟢 New fields
    chat: [
      {
        type: {
          type: String,
          enum: ["doctor", "patient"],
        },
        message: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    videoCallId: {
      type: String,
    },
  },
  { timestamps: true }
);

const RequestModel = mongoose.model("Request", requestSchema);
export default RequestModel;
