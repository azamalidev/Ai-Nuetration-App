import mongoose from "mongoose";

const Schema = mongoose.Schema;
const schema = Schema({
  name: { type: String, required: false, maxlength: 50 },
  age: { type: Number, required: false, },
  gender: { type: String, required: false, maxlength: 50 },
  weight: { type: Number, required: false, maxlength: 50 },
  height: { type: Number, required: false, maxlength: 50 },
  dietaryPreferance: { type: String, required: false, maxlength: 50 },
  healthGoal: { type: String, required: false, maxlength: 50 },
  activityLevel: { type: String, required: false, maxlength: 50 },
   profileImage: { type: String, default: '' }, // 👈 Add this line
  email: { type: String, required: true, maxlength: 50, unique: true },
  password: { type: String, required: true, maxlength: 5000 },
  role: {
    type: String,
    required: true,
    maxlength: 50,
    enum: ["USER", "ADMIN", "NUTRITIONIST"],
  },
  qualifications: { type: String, required: false, maxlength: 200 },
  specialization: { type: String, required: false, maxlength: 100 },
  yearsOfExperience: { type: Number, required: false },
  certifications: [{ type: String }],
  bio: { type: String, required: false, maxlength: 1000 },

});
export default mongoose.model("User", schema);
