import MealModel from "../models/meal.js";
import DishModel from "../models/dishes.js";

const MealService = {

    getAll: async () => {
        try {


            const meals = await MealModel.find()
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id')
                .sort({ plan_date: -1 });
            return { message: "success", data: meals };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Get all meals for a user
    getUserMeals: async (userId) => {
        try {
            const meals = await MealModel.find({ user_id: userId })
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id')
                .sort({ plan_date: -1 });
            return { message: "success", data: meals };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Get meal by ID
    getById: async (id) => {
        try {
            const meal = await MealModel.findById(id)
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id');
            if (!meal) {
                return { message: "error", data: "Meal plan not found" };
            }
            return { message: "success", data: meal };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Get meals by date range
    getMealsByDateRange: async (userId, startDate, endDate) => {
        try {
            const meals = await MealModel.find({
                user_id: userId,
                plan_date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id')
                .sort({ plan_date: 1 });

            return { message: "success", data: meals };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Get meal for specific date
    getMealByDate: async (userId, date) => {
        try {
            const meal = await MealModel.find({
                user_id: userId,
                plan_date: new Date(date)
            })
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id');

            if (!meal) {
                return { message: "error", data: "No meal plan found for this date" };
            }

            return { message: "success", data: meal };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Add new meal plan
    add: async (body) => {
        try {
            // Check if meal plan already exists for this user and date
            // const existingMeal = await MealModel.findOne({
            //     user_id: body.user_id, 
            //     plan_date: new Date(body.plan_date)
            // });

            // if (existingMeal) {
            //     return { message: "failed", data: "Meal plan already exists for this date" };
            // }

            // Calculate nutrition totals
            // const nutritionTotals = await this.calculateNutritionTotals(body);

            // const mealData = {
            //     ...body,
            //     ...nutritionTotals
            // };

            const savedMeal = await MealModel.create(body);
            // if (savedMeal) {
            // const populatedMeal = await MealModel.findById(savedMeal._id)
            // .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id');
            return { message: "success", data: savedMeal };
            // }
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Update meal plan
    update: async (body) => {
        try {
            const _id = body.id;

            // Calculate nutrition totals
            const nutritionTotals = await this.calculateNutritionTotals(body);

            const mealData = {
                ...body,
                ...nutritionTotals
            };

            const updatedMeal = await MealModel.findByIdAndUpdate(_id, mealData, {
                new: true,
                runValidators: true
            }).populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id');

            if (!updatedMeal) {
                return { message: "error", data: "Meal plan not found" };
            }

            return { message: "success", data: updatedMeal };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Delete meal plan
    // delete: async (id) => {
    //     try {
    //         const deletedMeal = await MealModel.findByIdAndDelete(id);
    //         if (!deletedMeal) {
    //             return { message: "error", data: "Meal plan not found" };
    //         }
    //         return { message: "success", data: "Meal plan deleted successfully" };
    //     } catch (error) {
    //         return { message: "error", data: error.message };
    //     }
    // },


    delete: async (id) => {
        try {
            const meal = await MealModel.findById(id);
            if (!meal) {
                return { message: "error", data: "Meal plan not found" };
            }

            // Delete related dishes
            const dishIds = [
                meal.breakfast_dish_id,
                meal.lunch_dish_id,
                meal.dinner_dish_id,
                meal.snack_dish_id,
            ].filter(Boolean); // filter out null or undefined

            await DishModel.deleteMany({ _id: { $in: dishIds } });

            // Delete the meal itself
            await MealModel.findByIdAndDelete(id);

            return { message: "success", data: "Meal plan and its dishes deleted successfully" };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },


    // Calculate nutrition totals from dishes
    calculateNutritionTotals: async (mealData) => {
        try {
            let totalCalories = 0;
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;

            const dishIds = [
                mealData.breakfast_dish_id,
                mealData.lunch_dish_id,
                mealData.dinner_dish_id,
                mealData.snack_dish_id
            ].filter(id => id); // Filter out null/undefined values

            if (dishIds.length > 0) {
                const dishes = await DishModel.find({ _id: { $in: dishIds } });

                dishes.forEach(dish => {
                    totalCalories += dish.calories || 0;
                    totalProtein += dish.protein || 0;
                    totalCarbs += dish.carbs || 0;
                    totalFat += dish.fat || 0;
                });
            }

            return {
                total_calories: totalCalories,
                total_protein: totalProtein,
                total_carbs: totalCarbs,
                total_fat: totalFat
            };
        } catch (error) {
            return {
                total_calories: 0,
                total_protein: 0,
                total_carbs: 0,
                total_fat: 0
            };
        }
    },

    // Get weekly meal plan
    getWeeklyMealPlan: async (userId, startDate) => {
        try {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); // 7 days total

            const meals = await MealModel.find({
                user_id: userId,
                plan_date: {
                    $gte: new Date(startDate),
                    $lte: endDate
                }
            })
                .populate('breakfast_dish_id lunch_dish_id dinner_dish_id snack_dish_id')
                .sort({ plan_date: 1 });

            return { message: "success", data: meals };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    },

    // Get nutrition summary for date range
    getNutritionSummary: async (userId, startDate, endDate) => {
        try {
            const meals = await MealModel.find({
                user_id: userId,
                plan_date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            });

            const summary = meals.reduce((acc, meal) => {
                acc.totalCalories += meal.total_calories || 0;
                acc.totalProtein += meal.total_protein || 0;
                acc.totalCarbs += meal.total_carbs || 0;
                acc.totalFat += meal.total_fat || 0;
                return acc;
            }, {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                totalDays: meals.length
            });

            // Calculate averages
            if (summary.totalDays > 0) {
                summary.avgCalories = summary.totalCalories / summary.totalDays;
                summary.avgProtein = summary.totalProtein / summary.totalDays;
                summary.avgCarbs = summary.totalCarbs / summary.totalDays;
                summary.avgFat = summary.totalFat / summary.totalDays;
            }

            return { message: "success", data: summary };
        } catch (error) {
            return { message: "error", data: error.message };
        }
    }
};

export default MealService;