import mongoose from "mongoose"
import config from "../config/index.js"

export default async function mongooseLoader() {
  const connection = mongoose.connection

  connection.once("connected", () => console.log("✅ Database Connected"))
  connection.on("error", error => console.error("❌ Database Error:", error))

  await mongoose.connect(config.env.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 // ⬅️ Forces IPv4
  })

  return connection.db
}
