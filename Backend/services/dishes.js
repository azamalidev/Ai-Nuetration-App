import DishModel from "../models/dishes.js";

const DishService = {
  // Get all dishes with optional filtering
  getAll: async (filters = {}) => {
    try {
      const query = {};

      // Add filters if provided
      if (filters.meal_type) query.meal_type = filters.meal_type;
      if (filters.is_vegetarian !== undefined)
        query.is_vegetarian = filters.is_vegetarian;
      if (filters.is_vegan !== undefined) query.is_vegan = filters.is_vegan;
      if (filters.is_gluten_free !== undefined)
        query.is_gluten_free = filters.is_gluten_free;
      if (filters.is_dairy_free !== undefined)
        query.is_dairy_free = filters.is_dairy_free;
      if (filters.is_keto !== undefined) query.is_keto = filters.is_keto;
      if (filters.cuisine_type) query.cuisine_type = filters.cuisine_type;
      if (filters.difficulty_level)
        query.difficulty_level = filters.difficulty_level;

      const dishes = await DishModel.find(query);
      return { message: "success", data: dishes };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  getUserDish: async (userId) => {
    try {
      const meals = await DishModel.find({ user_id: userId }).sort({
        plan_date: -1,
      });
      return { message: "success", data: meals };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Get single dish by ID
  getById: async (id) => {
    try {
      const dish = await DishModel.findById(id);
      if (!dish) {
        return { message: "error", data: "Dish not found" };
      }
      return { message: "success", data: dish };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Add new dish
  add: async (body) => {
    try {
      // Check if dish with same name already exists
      console.log(
        "🔧 DishService.add() - Creating dish with data:",
        JSON.stringify(body, null, 2),
      );

      const savedDish = await DishModel.create(body);
      if (savedDish) {
        console.log("✅ Dish created successfully:", savedDish._id);
        return { message: "success", data: savedDish };
      }
    } catch (error) {
      console.error("❌ DishService.add() - Error:", error.message);
      console.error("Error Details:", error.errors || error);
      return { message: "error", data: error.message };
    }
  },

  // Update dish
  update: async (body) => {
    try {
      const _id = body.id;
      const updatedDish = await DishModel.findByIdAndUpdate(_id, body, {
        new: true,
        runValidators: true,
      });

      if (!updatedDish) {
        return { message: "error", data: "Dish not found" };
      }

      return { message: "success", data: updatedDish };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Delete dish
  delete: async (id) => {
    try {
      const deletedDish = await DishModel.findByIdAndDelete(id);
      if (!deletedDish) {
        return { message: "error", data: "Dish not found" };
      }
      return { message: "success", data: "Dish deleted successfully" };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Search dishes by name or tags
  search: async (searchTerm) => {
    try {
      const dishes = await DishModel.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { tags: { $in: [new RegExp(searchTerm, "i")] } },
        ],
      });
      return { message: "success", data: dishes };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Get dishes by meal type
  getByMealType: async (mealType) => {
    try {
      const dishes = await DishModel.find({ meal_type: mealType });
      return { message: "success", data: dishes };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Get dishes by dietary preferences
  getByDietaryPreferences: async (preferences) => {
    try {
      const query = {};
      if (preferences.vegetarian) query.is_vegetarian = true;
      if (preferences.vegan) query.is_vegan = true;
      if (preferences.gluten_free) query.is_gluten_free = true;
      if (preferences.dairy_free) query.is_dairy_free = true;
      if (preferences.keto) query.is_keto = true;

      const dishes = await DishModel.find(query);
      return { message: "success", data: dishes };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },
};

export default DishService;
