import DishService from "../../services/dishes.js";
import MealService from "../../services/meal.js";
import UserService from "../../services/user.js";
import httpResponse from "../../utils/httpResponse.js";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";
import path from "path";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const controller = {
register: async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const uploadDir = path.join("uploads", "profileImages");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      // Save the buffer to disk
      fs.writeFileSync(filePath, req.file.buffer);

      // URL to serve image
      imageUrl = `/uploads/profileImages/${fileName}`;
    }

    const userData = {
      ...req.body,
      profileImage: imageUrl,
    };

    // Handle certifications if provided as comma-separated string
    if (userData.certifications && typeof userData.certifications === "string") {
      userData.certifications = userData.certifications.split(",").map(s => s.trim());
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

  analyzeFoodImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Convert image buffer to base64 for Gemini
      const base64Image = req.file.buffer.toString("base64");

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt =
        "Analyze this food image and give nutrients (calories, protein, fat, fiber, carbs)";

      const result = await model.generateContent([
        { inlineData: { mimeType: req.file.mimetype, data: base64Image } },
        prompt,
      ]);

      res.json({ data: result.response.text() });
    } catch (error) {
      console.error("Gemini error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  },

  generateMealPlan: async (req, res) => {
    try {
      console.log("=== MEAL PLAN GENERATION STARTED ===");

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

      const apiKey =
        process.env.GEMINI_API_KEY || "AIzaSyDrogsLkcPHlj3lA2b2vYJIBSFkr4sMk-I";
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

      const apiKey =
        process.env.GEMINI_API_KEY || "AIzaSyDrogsLkcPHlj3lA2b2vYJIBSFkr4sMk-I";
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
                  mealPlan
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
