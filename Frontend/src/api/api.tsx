// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Types for API responses
interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

interface RegisterData {
  email: string;
  password: string;
  role?: string;
  name?: string;
  bio?: string;
  certifications?: string[];
  yearsOfExperience?: number;
  specialization?: string;
  qualifications?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserProfile {
  _id: string;
  role: string;
  email: string;
}

interface GenerateMeal {
  healthGoal: string;
  dietaryPreferance: string;
  activityLevel: string;
  height: number;
  weight: number;
  gender: string;
  age: number;
}

interface MealInfo {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
}

interface MealPlan {
  date: string;
  breakfast: MealInfo;
  lunch: MealInfo;
  dinner: MealInfo;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// New interfaces for recipe recommendations
interface RecipeRecommendationRequest {
  availableIngredients: string[];
  dietaryPreferences?: string[];
  maxPrepTime?: number;
  cuisineType?: string;
}

interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
  calories: number;
  protein: number;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
}

// New interface for grocery list
interface GroceryListRequest {
  mealPlan: MealPlan;
}

interface GroceryItem {
  name: string;
  quantity: string;
  category: string;
}

interface Dish {
  _id?: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  is_keto: boolean;
  cuisine_type: string;
  difficulty_level: string;
  tags: string[];
}

interface DishFilters {
  meal_type?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  is_keto?: boolean;
  cuisine_type?: string;
  difficulty_level?: string;
}

interface DietaryPreferences {
  vegetarian?: boolean;
  vegan?: boolean;
  gluten_free?: boolean;
  dairy_free?: boolean;
  keto?: boolean;
}

// Add these interfaces to your existing types
interface MealPlanData {
  date: string;
  breakfast?: MealInfo;
  lunch?: MealInfo;
  dinner?: MealInfo;
  snacks?: MealInfo[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
}

interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  dailyBreakdown: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

// API utility functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response): Promise<ApiResponse> => {
  const json = await response.json().catch(() => ({
    meta: { message: "Network error" },
    data: null,
  }));

  if (!response.ok) {
    const errorMessage =
      typeof json.data === "string"
        ? json.data
        : json?.meta?.message || `HTTP error! status: ${response.status}`;

    console.error("❌ API Error:", {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
      fullResponse: json,
    });

    throw new Error(errorMessage);
  }

  return json;
};

// API service class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async register(userData: any, isMultipart = false): Promise<ApiResponse> {
    const headers: any = {};

    // ✅ Only set JSON content type when NOT using FormData
    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
      userData = JSON.stringify(userData);
    }

    // ✅ Never set headers manually for FormData
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers,
      body: userData,
    });

    return handleResponse(response);
  }

  async login(credentials: LoginData): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // no auth for login
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const result = await handleResponse(response);
    if (result.data?.token) {
      localStorage.setItem("authToken", result.data.token);
    }
    return result;
  }

  // REQUEST-RELATED METHODS
  async getAllRequests(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/requests`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async approveRequest(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/requests/${id}/approve`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async denyRequest(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/requests/${id}/deny`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async deleteRequest(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/requests/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Get user profile
  async getUserProfile(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  // Update user profile
  async updateUserProfile(userData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/profile/update`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  async updateUserAdmin(id: string, userData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/update/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  }

  // Logout user
  logout(): void {
    localStorage.removeItem("authToken");
  }

  async getAllUsers(): Promise<ApiResponse> {
    const url = `${this.baseUrl}/all`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async getUserById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async generateMealPlan(userProfile: GenerateMeal): Promise<ApiResponse> {
    const token = localStorage.getItem("authToken");
    const headers = getAuthHeaders();

    // ✅ Validate all required fields
    const requiredFields: (keyof GenerateMeal)[] = [
      "healthGoal",
      "dietaryPreferance",
      "activityLevel",
      "height",
      "weight",
      "gender",
      "age",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        userProfile[field] === undefined ||
        userProfile[field] === null ||
        userProfile[field] === "",
    );

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    console.log("🔵 Meal Plan Request:", {
      url: `${this.baseUrl}/mealGen`,
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      headers,
      payload: userProfile,
    });

    const response = await fetch(`${this.baseUrl}/mealGen`, {
      method: "POST",
      headers,
      body: JSON.stringify(userProfile),
    });

    console.log("Response status:", response.status);
    return handleResponse(response);
  }

  async getRecipeRecommendations(
    requestData: RecipeRecommendationRequest,
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/recipe`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  }

  async generateGroceryList(
    requestData: GroceryListRequest,
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/grocery`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // DISH-RELATED METHODS
  async getAllDishes(filters?: DishFilters): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const url = `${this.baseUrl}/dish/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async getUserDish(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getDishById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async addDish(dishData: Dish): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dishData),
    });
    return handleResponse(response);
  }

  async updateDish(id: string, dishData: Partial<Dish>): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...dishData, id }),
    });
    return handleResponse(response);
  }

  async deleteDish(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async searchDishes(searchTerm: string): Promise<ApiResponse> {
    const response = await fetch(
      `${this.baseUrl}/dish/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    return handleResponse(response);
  }

  async getDishesByMealType(mealType: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/dish/meal-type/${mealType}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async getDishesByDietaryPreferences(
    preferences: DietaryPreferences,
  ): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (preferences.vegetarian) queryParams.append("vegetarian", "true");
    if (preferences.vegan) queryParams.append("vegan", "true");
    if (preferences.gluten_free) queryParams.append("gluten_free", "true");
    if (preferences.dairy_free) queryParams.append("dairy_free", "true");
    if (preferences.keto) queryParams.append("keto", "true");
    const url = `${this.baseUrl}/dish/dietary-preferences${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  // MEAL-RELATED METHODS
  async createMealPlan(mealData: MealPlanData): Promise<ApiResponse> {
    console.log("mealData", mealData);
    const response = await fetch(`${this.baseUrl}/meal`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(mealData),
    });
    return handleResponse(response);
  }

  async getUserMeals(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/meal`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getMealById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/meal/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getAllMeals(): Promise<ApiResponse> {
    const url = `${this.baseUrl}/meal/all`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  }

  async updateMealPlan(
    id: string,
    mealData: Partial<MealPlanData>,
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/meal/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(mealData),
    });
    return handleResponse(response);
  }

  async deleteMealPlan(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/meal/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getMealByDate(date: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/meal/date/${date}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }

  async getMealsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse> {
    const queryParams = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${this.baseUrl}/meal/range/meals?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  }

  async getWeeklyMealPlan(startDate: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams({ startDate });
    const response = await fetch(
      `${this.baseUrl}/meal/weekly/plan?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  }

  async getNutritionSummary(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse> {
    const queryParams = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${this.baseUrl}/meal/nutrition/summary?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(response);
  }

  // DIAGNOSTIC METHOD - Check auth and token validity
  diagnosticCheckAuth(): void {
    const token = localStorage.getItem("authToken");
    const headers = getAuthHeaders();

    console.group("🔍 Authentication Diagnostic Check");
    console.log("API Base URL:", this.baseUrl);
    console.log("Token exists:", !!token);
    console.log("Token length:", token?.length || 0);
    console.log("Is authenticated:", this.isAuthenticated());
    console.log("Request headers:", headers);

    if (token) {
      const parts = token.split(".");
      console.log("Token format valid (3 parts):", parts.length === 3);

      try {
        const decoded = JSON.parse(atob(parts[1]));
        console.log("Token payload (decoded):", decoded);

        if (decoded.exp) {
          const expiryDate = new Date(decoded.exp * 1000);
          const isExpired = new Date() > expiryDate;
          console.log("Token expiry:", {
            expiryDate: expiryDate.toISOString(),
            isExpired: isExpired ? "⚠️ EXPIRED" : "✅ Valid",
          });
        }
      } catch (e) {
        console.warn("Could not decode token:", e);
      }
    } else {
      console.warn("⚠️ NO AUTH TOKEN FOUND - User needs to log in!");
    }

    console.groupEnd();
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type {
  RegisterData,
  LoginData,
  UserProfile,
  ApiResponse,
  GenerateMeal,
  MealPlan,
  MealPlanData,
  NutritionSummary,
  RecipeRecommendationRequest,
  RecipeRecommendation,
  GroceryListRequest,
  GroceryItem,
  Dish,
  DishFilters,
  DietaryPreferences,
};
