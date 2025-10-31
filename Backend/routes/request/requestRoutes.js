import express from "express";
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
} from "../../controllers/requestController.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

router.post("/consultation/request", authenticate, createRequest);
router.get("/consultation/my-requests", authenticate, getUserRequests);
router.put("/consultation/update-status", authenticate, updateRequestStatus);

export default router;
