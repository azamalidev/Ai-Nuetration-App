import express from "express";
import authValidation from "../../validations/user.validation.js";
import validate from "../../middlewares/validate.js";
import controllers from "./controllers.js";
import authenticate from "../../middlewares/authenticate.js";
import { StreamClient } from "@stream-io/node-sdk";
import jwt from "jsonwebtoken";
import upload from "../../middlewares/upload.js";


const router = express.Router();

router.post("/login", validate(authValidation.login), controllers.login);
router.post("/register", validate(authValidation.register), controllers.register);
router.get("/profile", authenticate, controllers.userProfile);
router.patch("/profile/update", authenticate, validate(authValidation.update), controllers.update);
router.patch("/update/:id", controllers.updateAdmin);
// ✅ SHOULD BE:
router.post("/mealGen", authenticate, controllers.generateMealPlan);
router.post("/recipe", controllers.getRecipeRecommendations);
router.post("/grocery", controllers.generateGroceryList);
router.get("/all", controllers.getAll);
router.get("/:id", controllers.getById);
router.delete("/:id", controllers.delete);

const serverClient = new StreamClient(
    process.env.STREAM_API_KEY,
    process.env.STREAM_SECRET_KEY
);


// router.get(
//     "/stream/token",
//     authenticate,
//     (req, res) => {
//         const streamUserId = String(req.user._id);
//         const streamToken = serverClient.createToken(streamUserId);
//         res.json({ token: streamToken });
//     }

// );
router.post(
  "/analyzeFood",
  authenticate,
  upload.single("image"), // must match "image" in FormData
  controllers.analyzeFoodImage
);




router.get(
    "/stream/token",
    authenticate,
    (req, res) => {
        const streamUserId = String(req.user._id);
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            user_id: streamUserId,
            iat: now - 15,       // issue 15s ago
            exp: now + 160 * 60,  // expires in 1h
        };
        const streamToken = jwt.sign(
            payload,
            process.env.STREAM_SECRET_KEY,
            { algorithm: "HS256" }
        );
        res.json({ token: streamToken });
  }
);

export default router;
