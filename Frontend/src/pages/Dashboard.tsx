import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Clipboard, ClipboardList } from 'lucide-react';
import { useAuthContext } from '../authContext';
import React, { useState, useEffect } from 'react';
import { Brain, Camera, ShoppingCart, Utensils, Video, Plus, X } from 'lucide-react';
import {
  apiService,
  MealPlan,
  GenerateMeal,
  RecipeRecommendation,
  RecipeRecommendationRequest,
  GroceryItem,
  GroceryListRequest
} from '../api/api';
import Navbar from '../components/navbar';
import EmeraldLoader from '../components/loader';
import VideoConsultation from '../components/VideoConsultation';
// Dashboard.tsx
import MyRequests from "../components/MyRequests"; // adjust the path
import DocterRequests from '../components/RequestsForDocters';


const Dashboard = () => {
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [foodFile, setFoodFile] = useState<File | null>(null);

  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  let userData = localStorage.getItem('user');
  const userInfo = userData ? JSON.parse(userData) : null;

  const [selectedFeature, setSelectedFeature] = useState(userInfo?.role == "NUTRITIONIST" ? 'consultation-requests' : 'meal-planning');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvingPlan, setApprovingPlan] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [approvingRecipe, setApprovingRecipe] = useState<number | null>(null);
  const [approvedRecipes, setApprovedRecipes] = useState<number[]>([]);
  const [mealPlanApproved, setMealPlanApproved] = useState(false); // New state for tracking approval
  const [user, setUser] = useState<any | null>(null);






  const { isLoading } = useAuthContext();

  // ✅ added: helper to check whether user's medical/profile fields are filled
  const isProfileComplete = () => {
    if (!user) return false;
    const required = ['age', 'gender', 'weight', 'height', 'dietaryPreferance', 'healthGoal', 'activityLevel'];
    return required.every((key) => {
      const val = user[key];
      // treat 0 or '0' as valid if needed — here we require truthy values
      return val !== undefined && val !== null && val !== '';
    });
  }; // ✅ added
  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId); // Tab activates
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile first.');
      return; // Stop feature content from loading
    }
    // Feature content will render normally if profile complete

    // else, feature content will render normally
  };


  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { apiService } = await import('../api/api');
      const response = await apiService.getUserProfile();


      if (response?.data) {
        const userData = {
          name: response.data.data.name || '',
          age: response.data.data.age || '',
          gender: response.data.data.gender || '',
          weight: response.data.data.weight || '',
          height: response.data.data.height || '',
          dietaryPreferance: response.data.data.dietaryPreferance || '',
          healthGoal: response.data.data.healthGoal || '',
          activityLevel: response.data.data.activityLevel || '',
          id: response.data.data._id || '',
        };
        setUser(userData);


      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div></div>;
  }
  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ added: block nutrition analysis upload if profile incomplete
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile .');
      return;
    } // ✅ added

    const file = e.target.files?.[0];
    if (!file) return;

    setFoodFile(file);
    setFoodImage(URL.createObjectURL(file));
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:50001/api/analyzeFood", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to analyze food");
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setAnalysisError(err.message || "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };






  const generateMealPlan = async () => {
    if (!user) {
      setError('Please log in to generate a meal plan');
      return;
    }

    // ✅ added: ensure profile is complete before generating meal plan
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile.');
      return;
    } // ✅ added

    setLoading(true);
    setError(null);

    try {
      const userProfile: GenerateMeal = {
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activityLevel,
        dietaryPreferance: user.dietaryPreferance,
        healthGoal: user.healthGoal,
      };

      const response = await apiService.generateMealPlan(userProfile);
      setMealPlan(response.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };


  const convertMealInfoToDish = (mealInfo: any, mealType: string): any => {
    return {
      name: mealInfo.name,
      description: mealInfo.description,
      ingredients: mealInfo.ingredients,
      instructions: mealInfo.instructions,
      servings: mealInfo.servings || 1,
      calories: mealInfo.calories,
      protein: mealInfo.protein,
      carbs: mealInfo.carbs,
      fat: mealInfo.fat,
      meal_type: mealType,
      is_vegetarian: user?.dietaryPreferance === 'vegetarian' || user?.dietaryPreferance === 'vegan',
      is_vegan: user?.dietaryPreferance === 'vegan',
      is_gluten_free: user?.dietaryPreferance === 'gluten-free',
      is_dairy_free: user?.dietaryPreferance === 'dairy-free',
      is_keto: user?.dietaryPreferance === 'keto',
      cuisine_type: 'international',
      difficulty_level: 'medium',
      tags: [mealType, user?.dietaryPreferance || 'general'].filter(Boolean)
    };
  };




  const approveMealPlan = async () => {
    if (!mealPlan || !user) {
      toast.error('No meal plan to approve or user not logged in');
      return;
    }

    setApprovingPlan(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert each meal to Dish format
      const breakfastDish = convertMealInfoToDish(mealPlan.breakfast, 'breakfast');
      const lunchDish = convertMealInfoToDish(mealPlan.lunch, 'lunch');
      const dinnerDish = convertMealInfoToDish(mealPlan.dinner, 'dinner');

      // Save each dish and get back the saved dish with _id
      const [savedBreakfast, savedLunch, savedDinner] = await Promise.all([
        apiService.addDish(breakfastDish),
        apiService.addDish(lunchDish),
        apiService.addDish(dinnerDish)
      ]);

      console.log("savedBreakfast, savedLunch, savedDinner", savedBreakfast, savedLunch, savedDinner)
      // Construct the meal plan data including user ID and dish IDs
      const mealPlanData: any = {
        user_id: user.id,
        plan_date: new Date().toISOString().split('T')[0],
        breakfast_dish_id: savedBreakfast.data._id,
        lunch_dish_id: savedLunch.data._id,
        dinner_dish_id: savedDinner.data._id,
        total_calories: mealPlan.totalCalories,
        total_protein: mealPlan.totalProtein,
        total_carbs: mealPlan.totalCarbs,
        total_fat: mealPlan.totalFat
      };

      // Save the meal plan
      await apiService.createMealPlan(mealPlanData);

      setMealPlanApproved(true); // Set approval state to true
      toast.success('Meal plan approved and saved successfully!');

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve meal plan');
    } finally {
      setApprovingPlan(false);
    }
  };

  const approveRecipe = async (recipe: RecipeRecommendation, index: number) => {
    setApprovingRecipe(index);
    setError(null);
    setSuccessMessage(null);

    try {
      const dishData = convertRecipeToDish(recipe);
      await apiService.addDish(dishData);

      // Add this line to track the approved recipe
      setApprovedRecipes(prev => [...prev, index]);

      setSuccessMessage(`Recipe "${recipe.name}" approved and saved successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve recipe');
    } finally {
      setApprovingRecipe(null);
    }
  };

  const getRecipeRecommendations = async () => {
    // ✅ added: require completed profile for recipe recommendations
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile ');
      return;
    } // ✅ added

    if (availableIngredients.length === 0) {
      setError('Please add some ingredients first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: RecipeRecommendationRequest = {
        availableIngredients,
        dietaryPreferences: user?.dietaryPreferance ? [user.dietaryPreferance] : [],
        maxprep_time: 60,
        cuisineType: 'any'
      };

      const response = await apiService.getRecipeRecommendations(requestData);
      setRecipes(response.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get recipe recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async () => {
    // ✅ added: require completed profile for grocery generation
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile');
      return;
    } // ✅ added

    if (!mealPlan) {
      setError('Please generate a meal plan first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: GroceryListRequest = {
        mealPlan
      };

      const response = await apiService.generateGroceryList(requestData);
      setGroceryList(response.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate grocery list');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !availableIngredients.includes(newIngredient.trim())) {
      setAvailableIngredients([...availableIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setAvailableIngredients(availableIngredients.filter(item => item !== ingredient));
  };

  const MealPlanningComponent = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-xl font-semibold">AI Meal Planning</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={generateMealPlan}
            disabled={loading || (mealPlan && mealPlanApproved)}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base ${mealPlan && !loading && mealPlanApproved
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
          >
            {loading ? 'Generating...' :
              mealPlan && mealPlanApproved ? 'Meal Plan Generated' : 'Generate New Plan'}
          </button>

          {mealPlan && !loading && (
            <button
              onClick={approveMealPlan}
              disabled={approvingPlan || mealPlanApproved}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base ${mealPlanApproved
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {approvingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Approving...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : mealPlanApproved ? (
                'Approved'
              ) : (
                'Approve Plan'
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}

      {loading && (
        <>
          <EmeraldLoader />
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </>
      )}

      {mealPlan && !loading && (
        <div className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h4 className="font-semibold text-emerald-800 mb-2">Daily Nutrition Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-emerald-600">{mealPlan.totalCalories}</div>
                <div className="text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-emerald-600">{mealPlan.totalProtein}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-emerald-600">{mealPlan.totalCarbs}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-emerald-600">{mealPlan.totalFat}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-orange-600 mb-2">🌅 Breakfast</h4>
              <h5 className="font-medium mb-2">{mealPlan.breakfast.name}</h5>
              <p className="text-sm text-gray-600 mb-3">{mealPlan.breakfast.description}</p>

              <div className="text-xs text-gray-500 mb-3">
                <span>{mealPlan.breakfast.calories} cal</span>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                  View Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Ingredients:</strong>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {mealPlan.breakfast.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside text-xs mt-1">
                      {mealPlan.breakfast.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </details>
            </div>

            {/* Lunch */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-yellow-600 mb-2">☀️ Lunch</h4>
              <h5 className="font-medium mb-2">{mealPlan.lunch.name}</h5>
              <p className="text-sm text-gray-600 mb-3">{mealPlan.lunch.description}</p>

              <div className="text-xs text-gray-500 mb-3">
                <span>{mealPlan.lunch.calories} cal</span>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                  View Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Ingredients:</strong>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {mealPlan.lunch.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside text-xs mt-1">
                      {mealPlan.lunch.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </details>
            </div>

            {/* Dinner */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-purple-600 mb-2">🌙 Dinner</h4>
              <h5 className="font-medium mb-2">{mealPlan.dinner.name}</h5>
              <p className="text-sm text-gray-600 mb-3">{mealPlan.dinner.description}</p>

              <div className="text-xs text-gray-500 mb-3">
                <span>{mealPlan.dinner.calories} cal</span>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                  View Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Ingredients:</strong>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {mealPlan.dinner.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside text-xs mt-1">
                      {mealPlan.dinner.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {!mealPlan && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Generate your personalized meal plan based on your profile
          </p>

        </div>
      )}
    </div>
  );

  const RecipesComponent = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-xl font-semibold">Recipe Recommendations</h3>
        <button
          onClick={getRecipeRecommendations}
          disabled={loading || availableIngredients.length === 0}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
        >
          {loading ? 'Finding Recipes...' : 'Get Recommendations'}
        </button>
      </div>
      {/* Ingredient Input */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Available Ingredients</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add an ingredient..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
          />
          <button
            onClick={addIngredient}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {availableIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableIngredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <>
          <EmeraldLoader />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-1 h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </>
      )}

      {recipes.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">{recipe.name}</h4>
              <button
                onClick={() => approveRecipe(recipe, index)}
                disabled={approvingRecipe === index || approvedRecipes.includes(index)}
                className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 text-sm ml-2 ${approvedRecipes.includes(index)
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {approvingRecipe === index ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : approvedRecipes.includes(index) ? (
                  <>
                    ✓ Saved
                  </>
                ) : (
                  <>
                    Save
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>🍽️ {recipe.servings} servings</span>
                <span>🔥 {recipe.calories} cal</span>
                <span className={`px-2 py-1 rounded-full ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {recipe.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {recipe.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                  View Recipe
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Ingredients:</strong>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {recipe.ingredients.map((ingredient, ingredientIndex) => (
                        <li key={ingredientIndex}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside text-xs mt-1">
                      {recipe.instructions.map((instruction, instructionIndex) => (
                        <li key={instructionIndex}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {recipes.length === 0 && !loading && availableIngredients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Add some ingredients to get personalized recipe recommendations
          </p>
        </div>
      )}
    </div>
  );

  const convertRecipeToDish = (recipe: RecipeRecommendation): any => {
    return {
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: 0, // Not provided in RecipeRecommendation
      fat: 0, // Not provided in RecipeRecommendation
      meal_type: 'general',
      is_vegetarian: recipe.tags.includes('vegetarian'),
      is_vegan: recipe.tags.includes('vegan'),
      is_gluten_free: recipe.tags.includes('gluten-free'),
      is_dairy_free: recipe.tags.includes('dairy-free'),
      is_keto: recipe.tags.includes('keto'),
      cuisine_type: 'international',

      difficulty_level: recipe.difficulty,
      user_id: user.id,
      tags: recipe.tags
    };
  };

  const GroceryListComponent = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-xl font-semibold">Smart Shopping List</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={generateGroceryList}
            disabled={loading || !mealPlan}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Generating...' : 'Generate List'}
          </button>

          {groceryList.length > 0 && !loading && (
            <button
              onClick={downloadGroceryList}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Download List
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {loading && (
        <>
          <EmeraldLoader />
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </>
      )}

      {groceryList.length > 0 && !loading && (
        <div className="space-y-4">
          {Object.entries(
            groceryList.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, GroceryItem[]>)
          ).map(([category, items]) => (
            <div key={category} className="border rounded-lg p-4">
              <h4 className="font-semibold text-emerald-700 mb-3 capitalize">{category}</h4>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {groceryList.length === 0 && !loading && !mealPlan && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Generate a meal plan first to create your shopping list
          </p>
          <button
            onClick={() => setSelectedFeature('meal-planning')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Meal Planning
          </button>
        </div>
      )}

      {groceryList.length === 0 && !loading && mealPlan && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Generate your shopping list based on your meal plan
          </p>
          <button
            onClick={generateGroceryList}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Generate Shopping List
          </button>
        </div>
      )}
    </div>
  );

  const downloadGroceryList = () => {
    if (!groceryList || groceryList.length === 0) {
      toast.error('No grocery list to download');
      return;
    }

    // Group items by category
    const groupedItems = groceryList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);

    // Create text content
    let content = `Grocery List - ${new Date().toLocaleDateString()}\n\n`;

    Object.entries(groupedItems).forEach(([category, items]) => {
      content += `${category.toUpperCase()}\n`;
      content += '='.repeat(category.length) + '\n';
      items.forEach(item => {
        content += `☐ ${item.name} - ${item.quantity}\n`;
      });
      content += '\n';
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  const features = userInfo.role == "NUTRITIONIST" ? [{
    id: 'consultation-requests',
    icon: ClipboardList,
    title: 'Consultaion Requests',
    component: DocterRequests,
  },] : [
    {
      id: 'meal-planning',
      icon: Brain,
      title: 'AI Meal Planning',
      component: MealPlanningComponent,
    },
    {
      id: 'nutrition-analysis',
      icon: Camera,
      title: 'Nutrition Analysis',
      component: () => (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Food Analysis</h3>

          <div className="space-y-4">
            {/* Image upload / preview */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              {foodImage ? (
                <img src={foodImage} alt="uploaded" className="mx-auto max-h-64 rounded-lg" />
              ) : (
                <>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a food image to analyze
                  </p>
                </>
              )}

              <div className="mt-2 flex justify-center gap-2">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  {foodImage ? "Re-upload" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFoodUpload}
                  />
                </label>

                {foodImage && (
                  <button
                    onClick={() => {
                      setFoodImage(null);
                      setFoodFile(null);
                      setAnalysisResult(null);
                      setAnalysisError(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {analysisLoading && <p className="text-gray-600 text-center">Analyzing...</p>}

            {/* Error */}
            {analysisError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {analysisError}
              </div>
            )}

            {/* Analysis result */}
            {analysisResult && (
              <div className="p-4 bg-emerald-50 rounded-lg text-sm text-gray-700 space-y-2">
                <p>🍽 Calories: {analysisResult.calories}</p>
                <p>🥦 Fiber: {analysisResult.fiber}</p>
                <p>🥩 Fat: {analysisResult.fat}</p>
                <p>🍚 Carbs: {analysisResult.carbs}</p>
                <p>💪 Protein: {analysisResult.protein}</p>
              </div>
            )}
          </div>
        </div>
      )
    },

    {
      id: 'grocery-list',
      icon: ShoppingCart,
      title: 'Grocery List',
      component: GroceryListComponent,
    },
    {
      id: 'recipes',
      icon: Utensils,
      title: 'Recipes',
      component: RecipesComponent,
    },
    {
      id: 'consultation',
      icon: Video,
      title: 'Video Consultation',
      component: () => <VideoConsultation />,
    },
    {
      id: 'myRequests',       // <-- Add My Requests here
      icon: Clipboard,
      title: 'My Requests',
      component: () => <MyRequests />,
    },
  ];


  const SelectedFeature = features.find((f) => f.id === selectedFeature)?.component;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)} // <-- Use the new helper here
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedFeature === feature.id

                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{feature.title}</span>
              </button>
            );
          })}
        </div>


        <div className="mt-8">
          {SelectedFeature ? <SelectedFeature /> : null}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;