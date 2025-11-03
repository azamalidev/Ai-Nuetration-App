import express from "express";
import cors from "cors";
import { } from "dotenv/config";
import loaders from "./loaders/index.js";
import config from "./config/index.js";
import userRoute from "./routes/user/index.js";
import getCallTokenRoute from "./routes/getCallToken.js";
import requestRoutes from "./routes/request/requestRoutes.js";

import path from "path";
async function startServer() {
  const app = express();

  // ---- CORS ----
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  app.use("/api/getCallToken", getCallTokenRoute);
  app.use("/uploads", express.static("uploads"));

  app.listen(5001, () => {
    console.log("Server running on port 5000");
  });
  // ---- JSON and URL Encoded parsers for NON file-upload routes ----
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  await loaders.init({ expressApp: app });

  // ---- MOUNT ROUTES ----  // Make sure multer is applied **inside your route** that handles file uploads


  app.use("/api", requestRoutes);

  app.use("/api", userRoute); // now /api/login, /api/register, /api/mealGen
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  const server = app.listen(config.env.port, () =>
    console.log(`Server Started ~ :${config.env.port}`)
  );

  process.on("uncaughtException", (err) => {
    console.log("uncaughtException! Shutting Down the Server...");
    console.log(err);
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection! Shutting Down the Server...");
    console.log(err);
    server.close(() => {
      process.exit(1);
    });
  });
}

startServer();
