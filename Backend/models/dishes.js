import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    description: {
        type: String,
        required: false
    },
    meal_type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    ingredients: {
        type: [String], // Array of strings
        required: true
    },
    instructions: {
        type: [String], // Array of strings
        required: true
    },

    servings: {
        type: Number,
        required: true,
        default: 1
    },

    // Nutrition info
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number, // in grams
        required: true
    },
    carbs: {
        type: Number, // in grams
        required: true
    },
    fat: {
        type: Number, // in grams
        required: true
    },

    // Dietary flags
    is_vegetarian: {
        type: Boolean,
        default: false
    },
    is_vegan: {
        type: Boolean,
        default: false
    },
    is_gluten_free: {
        type: Boolean,
        default: false
    },
    is_dairy_free: {
        type: Boolean,
        default: false
    },
    is_keto: {
        type: Boolean,
        default: false
    },

    // Additional info
    cuisine_type: {
        type: String,
        maxlength: 100,
        required: false
    },
    difficulty_level: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: {
        type: [String], // Array of strings for flexible categorization
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add indexes for common queries
schema.index({ meal_type: 1 });
schema.index({ is_vegetarian: 1 });
schema.index({ is_vegan: 1 });
schema.index({ difficulty_level: 1 });
schema.index({ cuisine_type: 1 });

export default mongoose.model("DishModel", schema);