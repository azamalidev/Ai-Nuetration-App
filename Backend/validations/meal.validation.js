import Joi from "joi";

const create = {
    body: Joi.object().keys({
        plan_date: Joi.date().required(),
        breakfast_dish_id: Joi.string().optional(),
        lunch_dish_id: Joi.string().optional(),
        dinner_dish_id: Joi.string().optional(),
        snack_dish_id: Joi.string().optional(),

        // Optional manual nutrition values (if not calculated automatically)
        total_calories: Joi.number().min(0).optional(),
        total_protein: Joi.number().min(0).optional(),
        total_carbs: Joi.number().min(0).optional(),
        total_fat: Joi.number().min(0).optional(),
    }).custom((value, helpers) => {
        // Ensure at least one dish is provided
        if (!value.breakfast_dish_id && !value.lunch_dish_id && !value.dinner_dish_id && !value.snack_dish_id) {
            return helpers.error('any.custom', {
                message: 'At least one dish must be provided for the meal plan'
            });
        }
        return value;
    }),
};

const update = {
    body: Joi.object().keys({
        plan_date: Joi.date(),
        breakfast_dish_id: Joi.string().allow(null),
        lunch_dish_id: Joi.string().allow(null),
        dinner_dish_id: Joi.string().allow(null),
        snack_dish_id: Joi.string().allow(null),

        // Optional manual nutrition values
        total_calories: Joi.number().min(0),
        total_protein: Joi.number().min(0),
        total_carbs: Joi.number().min(0),
        total_fat: Joi.number().min(0),
    }),
};

const id = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
};

const date = {
    params: Joi.object().keys({
        date: Joi.date().required(),
    }),
};

const dateRange = {
    query: Joi.object().keys({
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
    }),
};

const weeklyPlan = {
    query: Joi.object().keys({
        startDate: Joi.date().required(),
    }),
};

const nutritionSummary = {
    query: Joi.object().keys({
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
    }),
};

const getUserMeals = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional().min(Joi.ref('startDate')),
    }),
};

export default {
    create,
    update,
    id,
    date,
    dateRange,
    weeklyPlan,
    nutritionSummary,
    getUserMeals,
};