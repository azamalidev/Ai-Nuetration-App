import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../../index.css";

import { toast } from "react-toastify";
const ProfileUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isLoading = false,
  title = "Update Profile",
  subtitle = "Keep your health profile up to date for better recommendations.",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    dietaryPreferance: "",
    healthGoal: "",
    activityLevel: "",
    role: "",
    bio: "",
    certifications: "",
    yearsOfExperience: "",
    specialization: "",
    qualifications: "",
    ...initialData,
  });

  const dietaryPreferences = [
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low-Carb",
    "Gluten-Free",
    "No Restrictions",
  ];

  const healthGoals = [
    "Weight Loss",
    "Weight Gain",
    "Muscle Building",
    "Maintenance",
    "Improved Energy",
    "Better Sleep",
    "General Health",
  ];

  const activityLevels = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
    "Extremely Active",
  ];

  // Update form data when initialData changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields
    const requiredFields = [
      "name",
      "age",
      "gender",
      "weight",
      "height",
      "dietaryPreferance",
      "healthGoal",
      "activityLevel",
      "role",
    ];

    // Add extra requirements if nutritionist
    if (formData.role === "NUTRITIONIST") {
      requiredFields.push(
        "bio",
        "certifications",
        "yearsOfExperience",
        "specialization",
        "qualifications"
      );
    }

    // Check for missing fields
    const missing = requiredFields.filter(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );

    if (missing.length > 0) {
      toast.error("Please fill all required fields before submitting!");
      return;
    }

    // If validation passes
    if (onSubmit) {
      onSubmit(formData);
      toast.success("Profile updated successfully!");
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                required
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                required
                min="20"
                max="300"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter weight in kg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                required
                min="100"
                max="250"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.height}
                onChange={handleChange}
                placeholder="Enter height in cm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Preference
              </label>
              <select
                name="dietaryPreferance"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.dietaryPreferance}
                onChange={handleChange}
              >
                <option value="">Select preference</option>
                {dietaryPreferences.map((pref) => (
                  <option key={pref} value={pref.toLowerCase()}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Health Goal
              </label>
              <select
                name="healthGoal"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.healthGoal}
                onChange={handleChange}
              >
                <option value="">Select goal</option>
                {healthGoals.map((goal) => (
                  <option key={goal} value={goal.toLowerCase()}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                name="activityLevel"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.activityLevel}
                onChange={handleChange}
              >
                <option value="">Select level</option>
                {activityLevels.map((level) => (
                  <option key={level} value={level.toLowerCase()}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                disabled={true}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                <option value="USER">User</option>
                <option value="NUTRITIONIST">Nutritionist</option>
              </select>
            </div>
          </div>

          {/* Nutritionist-specific fields */}
          {formData.role === "NUTRITIONIST" && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your background and expertise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="e.g., BSc Nutrition, RD, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Sports Nutrition, Weight Management"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    min="0"
                    max="50"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="Number of years"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certifications
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={formData.certifications}
                    onChange={handleChange}
                    placeholder="e.g., RD, CNS, CCN (comma-separated)"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-10">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </span>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;
