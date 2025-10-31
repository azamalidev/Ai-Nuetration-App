import express from "express";
import { getUserRequests } from "../controllers/requestController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Fetch all requests for the logged-in user
router.get("/my-requests", authMiddleware, getUserRequests);

export default router;
