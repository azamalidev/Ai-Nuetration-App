import express from "express";
import mealValidation from "../../validations/meal.validation.js";
import validate from "../../middlewares/validate.js";
import controllers from "./controllers.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

// All meal routes require authentication since they're user-specific
// router.use(authenticate);

// Meal CRUD operations
router.post("/", controllers.create);
router.get("/all", controllers.getAll);
router.get("/date/:date", controllers.getMealByDate);
router.get("/range/meals", controllers.getMealsByDateRange);
router.get("/weekly/plan", controllers.getWeeklyMealPlan);
router.get("/nutrition/summary", controllers.getNutritionSummary);
router.get("/", controllers.getUserMeals);
router.get("/:id", controllers.getById); // move this to the bottom
router.put("/:id", validate(mealValidation.update), controllers.update);
router.delete("/:id", controllers.delete);

export default router;