import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const authHeader = req.headers.authorization; // use consistent lowercase

  if (!authHeader) {
    console.log("❌ Authenticate: No authorization header provided");
    console.log("Headers:", Object.keys(req.headers));
    return res.status(401).json({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log(
      "❌ Authenticate: Invalid token format. Format:",
      authHeader.substring(0, 50),
    );
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];
  if (!token) {
    console.log("❌ Authenticate: Token missing after Bearer");
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Authenticate: Token verified for user:", decoded._id);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Authenticate: Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
