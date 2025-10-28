import MealService from "../../services/meal.js";
import httpResponse from "../../utils/httpResponse.js";

const controller = {
    // Create new meal plan
    create: async (req, res) => {
        console.log("body", req.body)
        const addResponse = await MealService.add(req.body);
        if (addResponse.message === "success") {
            return httpResponse.CREATED(res, addResponse.data);
        } else if (addResponse.message === "failed") {
            return httpResponse.CONFLICT(res, addResponse.data);
        } else {
            return httpResponse.INTERNAL_SERVER(res, addResponse.data);
        }
    },

    // Get all meals for authenticated user
    getUserMeals: async (req, res) => {
        try {
            const data = await MealService.getUserMeals(req.user._id);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.INTERNAL_SERVER(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Get meal by ID
    getById: async (req, res) => {
        try {
            const data = await MealService.getById(req.params.id);
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
            const data = await MealService.getAll();
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.INTERNAL_SERVER(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Get meal by specific date
    getMealByDate: async (req, res) => {
        try {
            const { date } = req.params;
            const data = await MealService.getMealByDate(req.user._id, date);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.NOT_FOUND(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Get meals by date range
    getMealsByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return httpResponse.BAD_REQUEST(res, "Start date and end date are required");
            }

            const data = await MealService.getMealsByDateRange(req.user._id, startDate, endDate);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.INTERNAL_SERVER(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Get weekly meal plan
    getWeeklyMealPlan: async (req, res) => {
        try {
            const { startDate } = req.query;
            if (!startDate) {
                return httpResponse.BAD_REQUEST(res, "Start date is required");
            }

            const data = await MealService.getWeeklyMealPlan(req.user._id, startDate);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.INTERNAL_SERVER(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Update meal plan
    update: async (req, res) => {
        req.body.id = req.params.id;
        req.body.user_id = req.user._id; // Ensure user can only update their own meals

        const updateResponse = await MealService.update(req.body);
        if (updateResponse.message === "success") {
            return httpResponse.SUCCESS(res, updateResponse.data);
        } else {
            return httpResponse.INTERNAL_SERVER(res, updateResponse.data);
        }
    },

    // Delete meal plan
    delete: async (req, res) => {
        try {
            const data = await MealService.delete(req.params.id);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.NOT_FOUND(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    },

    // Get nutrition summary for date range
    getNutritionSummary: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return httpResponse.BAD_REQUEST(res, "Start date and end date are required");
            }

            const data = await MealService.getNutritionSummary(req.user._id, startDate, endDate);
            if (data.message === "success") {
                return httpResponse.SUCCESS(res, data.data);
            } else {
                return httpResponse.INTERNAL_SERVER(res, data.data);
            }
        } catch (error) {
            return httpResponse.INTERNAL_SERVER(res, error.message);
        }
    }
};

export default controller;