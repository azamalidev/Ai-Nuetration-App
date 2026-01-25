import express from "express";
import cors from "cors";
import {} from "dotenv/config";
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
      origin: "*",
    })
  );

  // ---- JSON and URL Encoded parsers ----
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ---- Static uploads folder ----
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ---- Initialize loaders ----
  await loaders.init({ expressApp: app });

  // ---- MOUNT ROUTES ----
  // Keep /api prefix for all main routes
  app.use("/api/getCallToken", getCallTokenRoute);
  app.use("/api", requestRoutes);
  app.use("/api", userRoute); // now /api/stream/token, /api/login, /api/register, etc.

  // ---- ERROR HANDLING ----
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

  // ---- START SERVER (AFTER all routes) ----
  app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
  });
}

startServer();
