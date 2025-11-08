// getCallToken.js
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// GET /api/get-stream-token?callId=...
router.get('/', async (req, res) => {
  const callId = req.query.callId;
  const userId = req.headers['x-user-id']; // Frontend sends this

  console.log("Received headers:", req.headers);
  console.log("callId:", callId, "userId:", userId);
  

  if (!userId) return res.status(401).json({ error: 'No token provided' });
  if (!callId) return res.status(400).json({ error: 'Call ID is required' });

  try {
    res.setHeader('Cache-Control', 'no-store');

    const response = await fetch('https://api.stream.io/video/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.STREAM_API_KEY}:${process.env.STREAM_API_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({ user_id: userId, call_id: callId })
    });

    const data = await response.json();
    console.log("Stream token response:", data);

    return res.status(200).json({ token: data.token, chatToken: data.chat_token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

export default router;
