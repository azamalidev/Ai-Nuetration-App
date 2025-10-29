import express from "express";
import cors from "cors"; // ← add this
import { } from "dotenv/config";
import loaders from "./loaders/index.js";
import config from "./config/index.js";
import userRoute from "./routes/user/index.js";
import path from "path";
async function startServer() {
  const app = express();

  // ---- ADD CORS MIDDLEWARE HERE ----
  app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // if you need cookies/auth
  }));

  // Needed middlewares
  app.use(express.json()); // parse JSON
  app.use(express.urlencoded({ extended: true }));

  await loaders.init({ expressApp: app });

  // ---- MOUNT ROUTES ----
  app.use("/api", userRoute);  // now /api/login, /api/register, /api/mealGen
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
