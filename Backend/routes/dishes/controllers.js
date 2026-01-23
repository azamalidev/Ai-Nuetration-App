import DishService from "../../services/dishes.js";
import httpResponse from "../../utils/httpResponse.js";

const controller = {
  // Create new dish
  create: async (req, res) => {
    try {
      console.log(
        "📍 POST /dish - Received data:",
        JSON.stringify(req.body, null, 2),
      );
      console.log("👤 User ID:", req.user?._id);

      const addResponse = await DishService.add(req.body);
      if (addResponse.message === "success") {
        return httpResponse.CREATED(res, addResponse.data);
      } else if (addResponse.message === "failed") {
        return httpResponse.CONFLICT(res, addResponse.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, addResponse.data);
      }
    } catch (error) {
      console.error("❌ ERROR in POST /dish:", error);
      return res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  // Get all dishes with optional filtering
  getAll: async (req, res) => {
    try {
      const filters = req.query; // Extract filters from query parameters
      const data = await DishService.getAll(filters);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },
  getUserDish: async (req, res) => {
    try {
      const data = await DishService.getUserDish(req.user._id);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Get dish by ID
  getById: async (req, res) => {
    try {
      const data = await DishService.getById(req.params.id);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.NOT_FOUND(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Update dish
  update: async (req, res) => {
    req.body.id = req.params.id;

    const updateResponse = await DishService.update(req.body);
    if (updateResponse.message === "success") {
      return httpResponse.SUCCESS(res, updateResponse.data);
    } else {
      return httpResponse.INTERNAL_SERVER(res, updateResponse.data);
    }
  },

  // Delete dish
  delete: async (req, res) => {
    try {
      const data = await DishService.delete(req.params.id);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.NOT_FOUND(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Search dishes
  search: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return httpResponse.BAD_REQUEST(res, "Search term is required");
      }

      const data = await DishService.search(q);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Get dishes by meal type
  getByMealType: async (req, res) => {
    try {
      const { mealType } = req.params;
      const data = await DishService.getByMealType(mealType);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },

  // Get dishes by dietary preferences
  getByDietaryPreferences: async (req, res) => {
    try {
      const preferences = req.query; // Extract preferences from query parameters
      const data = await DishService.getByDietaryPreferences(preferences);
      if (data.message === "success") {
        return httpResponse.SUCCESS(res, data.data);
      } else {
        return httpResponse.INTERNAL_SERVER(res, data.data);
      }
    } catch (error) {
      return httpResponse.INTERNAL_SERVER(res, error.message);
    }
  },
};

export default controller;
