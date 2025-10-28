import express from "express";
import dishValidation from "../../validations/dish.validation.js";
import validate from "../../middlewares/validate.js";
import controllers from "./controllers.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

// Public routes - Get dishes (no authentication required)
router.get("/all", controllers.getAll);
router.get("/", controllers.getUserDish);
router.get("/search", controllers.search);
router.get("/meal-type/:mealType", controllers.getByMealType);
router.get("/dietary-preferences", controllers.getByDietaryPreferences);
router.get("/:id", controllers.getById);

// Protected routes - Require authentication
router.post("/", authenticate, validate(dishValidation.create), controllers.create);
router.put("/:id", authenticate, validate(dishValidation.update), controllers.update);
router.delete("/:id", authenticate, controllers.delete);

export default router; 