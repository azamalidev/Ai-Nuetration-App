import DishService from "../../services/dishes.js";
import MealService from "../../services/meal.js";
import UserService from "../../services/user.js";
import multer from "multer";
import httpResponse from "../../utils/httpResponse.js";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Update consultation status
import { StreamClient } from "@stream-io/node-sdk";
import mongoose from "mongoose";

// Initialize Stream client
const serverClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_SECRET_KEY,
);

export const checkFoodForUser = async ({
  item,
  quantity,
  unit,
  userProfile,
  base64Image = null,
  mimetype = null,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are a nutrition and fitness expert.
Give general dietary advice only (not medical).

User Profile:
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Weight: ${userProfile.weight} kg
Height: ${userProfile.height} cm
Activity Level: ${userProfile.activityLevel}
Dietary Preference: ${userProfile.dietaryPreferance}
Health Goal: ${userProfile.healthGoal}

Food Item:
Item: ${item}
Quantity: ${quantity} ${unit}

Respond ONLY in valid JSON:
{
  "isGood": true,
  "recommendedQuantity": "string",
  "reason": "string",
  "tips": "string"
}
`;

  // 🧠 Build parts dynamically (image OPTIONAL)
  const parts = [];

  if (base64Image && mimetype) {
    parts.push({
      inlineData: {
        mimeType: mimetype,
        data: base64Image,
      },
    });
  }

  parts.push({ text: prompt });

  const requestBody = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${errText}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
    "";

  console.log(text, "text");
  // 🛡️ Safe JSON parsing
  return safeParseAIJSON(text);
};

function safeParseAIJSON(text) {
  if (!text) return fallback();

  const cleanText = text.replace(/```json|```/g, "").trim();

  // 🔥 Detect incomplete JSON
  if (cleanText.includes('"reason":') && !cleanText.includes("}")) {
    return fallback();
  }

  try {
    return JSON.parse(cleanText);
  } catch {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return fallback();
  }
}

const controller = {
  register: async (req, res) => {
    try {
      let imageUrl = null;

      if (req.file && req.file.buffer) {
        // ensure upload folder exists
        const uploadDir = path.join(process.cwd(), "uploads/profileImages");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // generate unique filename
        const ext = path.extname(req.file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}${ext}`;

        // full path on disk
        const filePath = path.join(uploadDir, uniqueName);

        // write the buffer to disk
        fs.writeFileSync(filePath, req.file.buffer);

        // generate public URL
        imageUrl = `/uploads/profileImages/${uniqueName}`;
      }

      const userData = {
        ...req.body,
        profileImage: imageUrl,
      };

      // Handle certifications if provided as comma-separated string
      if (
        userData.certifications &&
        typeof userData.certifications === "string"
      ) {
        userData.certifications = userData.certifications
          .split(",")
          .map((s) => s.trim());
      }

      const addResponse = await UserService.add(userData);

      if (addResponse.message === "success") {
        return httpResponse.CREATED(res, addResponse.data);
      } else if (addResponse.message === "failed") {
        return httpResponse.CONFLICT(res, addResponse.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, addResponse.data);
      }
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Registration failed" });
    }
  },

  login: async (req, res) => {
    const data = await UserService.login(req.body);
    if (data.message === "success") {
      return httpResponse.SUCCESS(res, data.data);
    } else {
      return httpResponse.NOT_FOUND(res, data.data, data.data);
    }
  },

  getNutratious: async (req, res) => {
    const data = await UserService.getNutratious(req.body);
    if (data.message === "success") {
      return httpResponse.SUCCESS(res, data.data);
    } else {
      return httpResponse.NOT_FOUND(res, data.data, data.data);
    }
  },

  userProfile: async (req, res) => {
    try {
      const data = await UserService.UserProfile(req.user._id);
      const meals = await MealService.getUserMeals(req.user._id);
      const dish = await DishService.getUserDish(req.user._id);

      return httpResponse.SUCCESS(res, {
        data,
        meals,
        dish,
      });
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error);
    }
  },

  syncDevice: async (req, res) => {
    try {
      const { client_Device_Id } = req.body;
      if (!client_Device_Id) {
        return httpResponse.BAD_REQUEST(res, {
          error: "Device info is required",
        });
      }

      const data = await UserService.syncDevice(req.body);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  checkDietForMe: async (req, res) => {
    try {
      const { client_Device_Id, item, quantity, unit } = req.body;

      const base64Image = req?.file?.buffer?.toString("base64");

      if (!client_Device_Id || !item || !quantity) {
        return httpResponse.BAD_REQUEST(res, {
          error: "Missing required device data",
        });
      }

      // 1️⃣ Find user using device ID
      const userProfile = await UserService.UserProfileByDeviceId(
        client_Device_Id,
      );

      if (!userProfile) {
        return httpResponse.NOT_FOUND(res, {
          error: "User not found for this device",
        });
      }

      // 2️⃣ Send data to Gemini AI
      const aiResponse = await checkFoodForUser({
        item,
        quantity,
        unit,
        mimetype: req?.file?.mimetype,
        base64Image,
        userProfile,
      });

      return httpResponse.SUCCESS(res, {
        deviceId: client_Device_Id,
        item,
        result: aiResponse,
      });
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    req.body.id = req.user._id;

    const updateResponse = await UserService.update(req.body);
    if (updateResponse) {
      return httpResponse.SUCCESS(res, updateResponse);
    } else {
      return httpResponse.INTERNAL_SERVER(res, updateResponse);
    }
  },

  updateAdmin: async (req, res) => {
    console.log("gggzsxdcfvg", req.body);
    req.body.id = req.params.id;

    const updateResponse = await UserService.update(req.body);
    console.log("updateResponse", updateResponse);
    if (updateResponse) {
      return httpResponse.SUCCESS(res, updateResponse);
    } else {
      return httpResponse.INTERNAL_SERVER(res, updateResponse);
    }
  },

  delete: async (req, res) => {
    try {
      const data = await UserService.delete(req.params.id);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.NOT_FOUND(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await UserService.getAll();
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Get user by ID
  getById: async (req, res) => {
    try {
      const data = await UserService.getById(req.params.id);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.NOT_FOUND(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Send a consultation request
  sendConsultationRequest: async (req, res) => {
    try {
      const { nutritionistId, time, reason, mode, userId } = req.body;
      const request = await Consultation.create({
        user: req.user._id,
        nutritionist: nutritionistId,
        time,
        reason,
        mode,
      });
      return res.status(201).json({ message: "Request sent", data: request });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to send request", error: error.message });
    }
  },
  sendConsultationRequest: async (req, res) => {
    try {
      const { nutritionistId, time, reason, mode } = req.body;

      if (!nutritionistId || !time || !reason) {
        return res.status(400).json({ message: "Fill all fields" });
      }

      const user = await UserService.getById(req.user._id);
      if (!user || user.message === "error") {
        return res.status(404).json({ message: "User not found" });
      }

      // Add consultation request to user
      const updatedUser = await UserService.addConsultationRequest(
        req.user._id,
        {
          nutritionist: nutritionistId,
          time,
          reason,
          mode,
        },
      );

      if (updatedUser.message === "success") {
        return res.status(201).json({
          message: "Request sent successfully",
          data: updatedUser.data,
        });
      } else {
        return res
          .status(500)
          .json({ message: "Failed to send request", error: updatedUser.data });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to send request", error: error.message });
    }
  },

  // Get pending requests for a nutritionist
  getPendingConsultations: async (req, res) => {
    try {
      const requests = await Consultation.find({
        nutritionist: req.user._id,
        status: "pending",
      }).populate("user", "-password");
      return res.status(200).json({ data: requests });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to fetch requests", error: error.message });
    }
  },

  updateConsultationStatus: async (req, res) => {
    try {
      const { requestId, status } = req.body;

      // 1️⃣ Update consultation
      const updated = await Consultation.findByIdAndUpdate(
        requestId,
        { status },
        { new: true },
      );

      if (!updated) {
        return res.status(404).json({ message: "Consultation not found" });
      }

      // 2️⃣ Run only when status is Approved
      if (status === "Approved") {
        const { mode, nutritionistId, userId } = updated;

        // 🟢 CHAT MODE
        if (mode === "Chat") {
          updated.chat = [];
          await updated.save();
        }

        // 🎥 VIDEO MODE
        else if (mode === "Video") {
          if (!nutritionistId || !userId) {
            return res.status(400).json({
              message: "Missing nutritionistId or userId for video call",
            });
          }

          // 3️⃣ Create Stream.io call
          const callId = `call_${updated._id}`;
          const call = serverClient.video.call("default", callId);

          await call.create({
            created_by_id: nutritionistId.toString(),
            members: [
              { user_id: nutritionistId.toString(), role: "host" },
              { user_id: userId.toString(), role: "guest" },
            ],
          });

          // 4️⃣ Generate video link
          const videoLink = `https://app.stream-io-video.com/call/default/${callId}`;
          updated.videoLink = videoLink;

          await updated.save();
        }
      }

      return res.status(200).json({
        message: "Consultation updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Update consultation error:", error);
      return res.status(500).json({
        message: "Failed to update consultation",
        error: error.message,
      });
    }
  },

analyzeFoodImage: async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not found" });
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString("base64");

    // Gemini API URL
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Prompt asking Gemini to analyze food
    const prompt = `
Analyze this food image and return the nutrients (calories, protein, fat, fiber, carbs) in JSON format.
Respond ONLY with valid JSON like:
{
  "calories": 200,
  "protein": 10,
  "fat": 5,
  "fiber": 3,
  "carbs": 30
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
    };

    // Call Gemini
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return res.status(500).json({ error: "Failed to analyze image", details: errText });
    }

    const data = await response.json();

    // Extract the response text
    const rawText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

    // Safe JSON parsing
    const nutrients = safeParseAIJSON(rawText);

    return res.status(200).json({ data: nutrients });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ error: "Failed to analyze image", details: error.message });
  }
},


  generateMealPlan: async (req, res) => {
    try {
      console.log("=== MEAL PLAN GENERATION STARTED ===");
      console.log("📝 Request headers:", {
        auth: req.headers.authorization ? "Present" : "Missing",
        contentType: req.headers["content-type"],
      });
      console.log("👤 req.user:", req.user);
      console.log("📦 Request body:", req.body);

      // Keep user validation
      const userData = await UserService.getById(req.user._id);

      if (!userData || userData.message !== "success") {
        console.log("❌ User not found");
        return httpResponse.NOT_FOUND(res, {
          error: "User profile not found. Please login again.",
        });
      }

      const userProfile = userData.data;
      console.log("✅ User profile loaded:", userProfile.email);

      if (!userProfile.age || !userProfile.weight || !userProfile.height) {
        console.log("❌ Incomplete profile");
        return httpResponse.BAD_REQUEST(res, {
          error:
            "Please complete your profile (age, weight, height) in settings before generating a meal plan",
        });
      }

      // Rest of the function with fixed Gemini API integration
      const prompt = `You are a certified nutritionist AI. Generate a personalized daily meal plan in JSON format.

User Profile:
- Age: ${userProfile.age || "not specified"}
- Gender: ${userProfile.gender || "not specified"}
- Weight: ${userProfile.weight || "not specified"} kg
- Height: ${userProfile.height || "not specified"} cm
- Activity Level: ${userProfile.activityLevel || "moderate"}
- Dietary Preferences: ${userProfile.dietaryPreferance || "none"}
- Health Goals: ${userProfile.healthGoal || "maintain health"}

Return ONLY valid JSON with no extra text or formatting:
{
  "date": "2025-10-25",
  "breakfast": {
    "name": "Meal name here",
    "description": "Brief description",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "prepTime": 15,
    "calories": 350,
    "protein": 20,
    "carbs": 40,
    "fat": 10,
    "servings": 1
  },
  "lunch": {/* same structure as breakfast */},
  "dinner": {/* same structure as breakfast */},
  "totalCalories": 1450,
  "totalProtein": 85,
  "totalCarbs": 170,
  "totalFat": 45
}`;

      // ...existing code...

      // ...existing code...

      const apiKey = process.env.GEMINI_API_KEY;

      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      console.log("📡 Calling Gemini API...");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", JSON.stringify(errorData, null, 2));
        return httpResponse.INTERNAL_SERVER(res, {
          error: "Failed to generate meal plan",
          details: errorData,
        });
      }

      const data = await response.json();
      console.log("📄 Raw API response:", JSON.stringify(data, null, 2));

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.output ||
        null;

      if (!rawText) {
        console.error("❌ No valid response from API");
        return httpResponse.INTERNAL_SERVER(res, {
          error: "No valid meal plan received from the API.",
          response: data,
        });
      }

      try {
        let jsonText = rawText.trim();
        if (jsonText.includes("```json")) {
          jsonText = jsonText.split("```json")[1].split("```")[0].trim();
        } else if (jsonText.includes("```")) {
          jsonText = jsonText.split("```")[1].split("```")[0].trim();
        }

        const mealPlan = JSON.parse(jsonText);
        console.log("✅ Meal plan generated successfully");
        return httpResponse.SUCCESS(res, mealPlan);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError, "Raw text:", rawText);
        return httpResponse.INTERNAL_SERVER(res, {
          error: "Failed to parse meal plan JSON",
          details: parseError.message,
          rawText: rawText,
        });
      }
    } catch (error) {
      console.error("💥 FATAL ERROR:", error);
      return httpResponse.INTERNAL_SERVER(res, {
        error: `Failed to generate meal plan: ${error.message}`,
      });
    }
  },

  getRecipeRecommendations: async (req, res) => {
    try {
      const {
        availableIngredients = [],
        dietaryPreferences = [],
        maxPrepTime,
        cuisineType,
      } = req.body;

      // Validate input
      if (
        !availableIngredients ||
        !Array.isArray(availableIngredients) ||
        availableIngredients.length === 0
      ) {
        return httpResponse.BAD_REQUEST(res, {
          error: "Please provide at least one available ingredient",
        });
      }

      const systemPrompt = `You are a professional chef AI. Create recipe recommendations based on available ingredients and preferences.
      
      Available Ingredients: ${availableIngredients.join(", ")}
      Dietary Preferences: ${dietaryPreferences.join(", ") || "none"}
      Max Prep Time: ${maxPrepTime || "no limit"} minutes
      Cuisine Type: ${cuisineType || "any"}
      
      Generate 3-5 recipe recommendations that make good use of the available ingredients.
      Provide detailed, easy-to-follow instructions.
      Include accurate nutritional estimates and cooking tags.
      
      Respond with JSON in this exact format:`;

      const apiKey = process.env.GEMINI_API_KEY || "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                instructions: { type: "array", items: { type: "string" } },
                prepTime: { type: "number" },
                cookTime: { type: "number" },
                servings: { type: "number" },
                calories: { type: "number" },
                protein: { type: "number" },
                tags: { type: "array", items: { type: "string" } },
                difficulty: {
                  type: "string",
                  enum: ["easy", "medium", "hard"],
                },
              },
              required: [
                "name",
                "description",
                "ingredients",
                "instructions",
                "prepTime",
                "cookTime",
                "servings",
                "calories",
                "protein",
                "tags",
                "difficulty",
              ],
            },
          },
        },
        contents: [
          {
            parts: [
              {
                text: "Generate recipe recommendations based on the provided ingredients and preferences.",
              },
            ],
          },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`Error response from API: ${response.status}`);
        return httpResponse.INTERNAL_SERVER(res, {
          error:
            "Failed to generate recipe recommendations. Please try again later.",
        });
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawJson) {
        return httpResponse.INTERNAL_SERVER(res, {
          error: "No valid recipe recommendations received from the API.",
        });
      }

      const recipes = JSON.parse(rawJson);
      return httpResponse.SUCCESS(res, recipes);
    } catch (error) {
      console.error("Error getting recipe recommendations:", error);
      return httpResponse.INTERNAL_SERVER(res, {
        error: `Failed to get recipe recommendations: ${error.message}`,
      });
    }
  },

  generateGroceryList: async (req, res) => {
    try {
      const { mealPlan } = req.body;

      // Validate input
      if (!mealPlan) {
        return httpResponse.BAD_REQUEST(res, {
          error: "Please provide a meal plan to generate grocery list",
        });
      }

      const systemPrompt = `You are a meal planning assistant. Generate a comprehensive grocery list from the provided meal plan.
      
      Organize ingredients by category (produce, proteins, dairy, pantry, etc.).
      Estimate appropriate quantities for the number of servings.
      Group similar items together and avoid duplicates.
      
      Respond with JSON in this exact format:`;

      const apiKey = process.env.GEMINI_API_KEY || "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "string" },
                category: { type: "string" },
              },
              required: ["name", "quantity", "category"],
            },
          },
        },
        contents: [
          {
            parts: [
              {
                text: `Generate a grocery list for this meal plan: ${JSON.stringify(
                  mealPlan,
                )}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`Error response from API: ${response.status}`);
        return httpResponse.INTERNAL_SERVER(res, {
          error: "Failed to generate grocery list. Please try again later.",
        });
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawJson) {
        return httpResponse.INTERNAL_SERVER(res, {
          error: "No valid grocery list received from the API.",
        });
      }

      const groceryList = JSON.parse(rawJson);
      return httpResponse.SUCCESS(res, groceryList);
    } catch (error) {
      console.error("Error generating grocery list:", error);
      return httpResponse.INTERNAL_SERVER(res, {
        error: `Failed to generate grocery list: ${error.message}`,
      });
    }
  },
};

export default controller;
