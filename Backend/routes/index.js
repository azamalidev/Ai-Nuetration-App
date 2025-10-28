import express from "express";

// routes

import userRoute from "./user/index.js";
import dishRoute from "./dishes/index.js";
import mealRoute from "./meal/index.js";

import authenticate from "../middlewares/authenticate.js";

const protectedRouter = express.Router();
const unProtectedRouter = express.Router();



// Un-Protected Routes
unProtectedRouter.use("/", userRoute); // Add /user prefix
unProtectedRouter.use("/meal", mealRoute);
unProtectedRouter.use("/dish", dishRoute);


export { protectedRouter, unProtectedRouter };
