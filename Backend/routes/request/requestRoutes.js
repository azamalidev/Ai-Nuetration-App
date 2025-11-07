import express from "express";
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
  getDocterRequests,
  updateRequest,
  updateRequestChat,
  getStreamToken
} from "../../controllers/requestController.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

router.post("/consultation/request", authenticate, createRequest);
router.patch("/consultation/request/:id", authenticate, updateRequest);
router.get("/consultation/my-requests", authenticate, getUserRequests);
router.get("/consultation/docter-requests", authenticate, getDocterRequests);
router.get("/consultation/getStreamToken", authenticate, getStreamToken);
router.put("/consultation/update-status", authenticate, updateRequestStatus);
router.patch("/consultation/chat/:id", authenticate, updateRequestChat);



export default router;
