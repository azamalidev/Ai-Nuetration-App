import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan_date: {
        type: Date,
        required: true
    },
    breakfast_dish_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DishModel',
        required: false
    },
    lunch_dish_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DishModel',
        required: false
    },
    dinner_dish_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DishModel',
        required: false
    },
    snack_dish_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DishModel',
        required: false
    },

    // Calculated totals (can be computed from dish nutrition)
    total_calories: {
        type: Number,
        default: 0
    },
    total_protein: {
        type: Number,
        default: 0
    },
    total_carbs: {
        type: Number,
        default: 0
    },
    total_fat: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,

});



export default mongoose.model("MealModel", schema);