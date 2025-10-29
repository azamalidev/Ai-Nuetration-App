const environment = {
  port: process.env.PORT || 50001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.DB_URI || "mongodb+srv://zainabsarwar58:zainab984@cluster0.zjkfo.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0",
  
  // Add these lines for Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // Your other API keys
  jwtSecret: process.env.JWT_SECRET,
  streamApiKey: process.env.STREAM_API_KEY,
  streamSecretKey: process.env.STREAM_SECRET_KEY
};

export default environment;