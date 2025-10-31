import express from "express";
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
  getDocterRequests,
  updateRequest
} from "../../controllers/requestController.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

router.post("/consultation/request", authenticate, createRequest);
router.patch("/consultation/request/:id", authenticate, updateRequest);
router.get("/consultation/my-requests", authenticate, getUserRequests);
router.get("/consultation/docter-requests", authenticate, getDocterRequests);
router.put("/consultation/update-status", authenticate, updateRequestStatus);

export default router;
