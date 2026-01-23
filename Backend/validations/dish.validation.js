import Joi from "joi";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required().max(255),
    description: Joi.string().optional(),
    meal_type: Joi.string()
      .valid("breakfast", "lunch", "dinner", "snack")
      .required(),
    ingredients: Joi.array().items(Joi.string()).min(1).required(),
    instructions: Joi.array().items(Joi.string()).min(1).required(),
    servings: Joi.number().integer().min(1).default(1),

    // Nutrition info
    calories: Joi.number().min(0).required(),
    protein: Joi.number().min(0).required(),
    carbs: Joi.number().min(0).required(),
    fat: Joi.number().min(0).required(),

    // Dietary flags
    is_vegetarian: Joi.boolean().default(false),
    is_vegan: Joi.boolean().default(false),
    is_gluten_free: Joi.boolean().default(false),
    is_dairy_free: Joi.boolean().default(false),
    is_keto: Joi.boolean().default(false),

    // Additional info
    cuisine_type: Joi.string().max(100).optional(),
    difficulty_level: Joi.string()
      .valid("easy", "medium", "hard")
      .default("medium"),
    user_id: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};
const validate = (schema) => async (req, res, next) => {
  try {
    if (schema.body) {
      await schema.body.validateAsync(req.body);
    }

    if (schema.params) {
      await schema.params.validateAsync(req.params);
    }

    if (schema.query) {
      await schema.query.validateAsync(req.query);
    }

    next();
  } catch (error) {
    return res.status(400).json({
      message: "Validation failed",
      error: error.details?.[0]?.message || error.message,
    });
  }
};

const update = {
  body: Joi.object().keys({
    name: Joi.string().max(255),
    description: Joi.string(),
    meal_type: Joi.string().valid("breakfast", "lunch", "dinner", "snack"),
    ingredients: Joi.array().items(Joi.string()).min(1),
    instructions: Joi.array().items(Joi.string()).min(1),
    servings: Joi.number().integer().min(1),

    // Nutrition info
    calories: Joi.number().min(0),
    protein: Joi.number().min(0),
    carbs: Joi.number().min(0),
    fat: Joi.number().min(0),

    // Dietary flags
    is_vegetarian: Joi.boolean(),
    is_vegan: Joi.boolean(),
    is_gluten_free: Joi.boolean(),
    is_dairy_free: Joi.boolean(),
    is_keto: Joi.boolean(),

    // Additional info
    cuisine_type: Joi.string().max(100),
    difficulty_level: Joi.string().valid("easy", "medium", "hard"),
    tags: Joi.array().items(Joi.string()),
  }),
};

const id = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const mealType = {
  params: Joi.object().keys({
    mealType: Joi.string()
      .valid("breakfast", "lunch", "dinner", "snack")
      .required(),
  }),
};

const search = {
  query: Joi.object().keys({
    q: Joi.string().required().min(1),
  }),
};

const getAll = {
  query: Joi.object().keys({
    meal_type: Joi.string().valid("breakfast", "lunch", "dinner", "snack"),
    is_vegetarian: Joi.boolean(),
    is_vegan: Joi.boolean(),
    is_gluten_free: Joi.boolean(),
    is_dairy_free: Joi.boolean(),
    is_keto: Joi.boolean(),
    cuisine_type: Joi.string(),
    difficulty_level: Joi.string().valid("easy", "medium", "hard"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

const dietaryPreferences = {
  query: Joi.object().keys({
    vegetarian: Joi.boolean(),
    vegan: Joi.boolean(),
    gluten_free: Joi.boolean(),
    dairy_free: Joi.boolean(),
    keto: Joi.boolean(),
  }),
};

export default {
  create,
  update,
  id,
  mealType,
  search,
  getAll,
  dietaryPreferences,
};
