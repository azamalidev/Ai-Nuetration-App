
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import React, { useEffect, useState } from 'react';
import { Edit2, User, Target, Activity, Utensils, BookOpen, X, ArrowLeft, Flame, Heart, TrendingUp, Calendar } from 'lucide-react';
import MealsComponent from '../components/mealsProfile';
import RecipeComponent from '../components/recipeProfile';
import Navbar from '../components/navbar';
import ProfileUpdateModal from '../AdminPanel/components/UserUpdateModal';


function HealthProfile() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [mealsData, setMealsData] = useState<any[]>([]);
  const [recipeData, setRecipeData] = useState<any[]>([]);
  const [showMealsComponent, setShowMealsComponent] = useState(false);
  const [showRecipeComponent, setShowRecipeComponent] = useState(false);

  const [profileData, setProfileData] = useState<any>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    dietaryPreferance: '',
    healthGoal: '',
    activityLevel: '',
    role: '',
    bio: '',
    certifications: [],
    yearsOfExperience: '',
    specialization: '',
    qualifications: '',
  });



  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { apiService } = await import('../api/api');
      const response = await apiService.getUserProfile();
      console.log("response", response);

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
          role: response.data.data.role || '',
          bio: response.data.data.bio || '',
          certifications: response.data.data.certifications || [],
          yearsOfExperience: response.data.data.yearsOfExperience || '',
          specialization: response.data.data.specialization || '',
          qualifications: response.data.data.qualifications || '',
        };
        setProfileData(userData);

        if (response.data.meals?.data) {
          setMealsData(response.data.meals.data);
        }
        if (response.data.dish?.data) {
          setRecipeData(response.data.dish.data);
        }
      }
    } catch (error) {
  toast.error('Failed to load profile. Please try again.')    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleDeleteDish(dishId: any) {
    try {
      const { apiService } = await import('../api/api');
      const result = await apiService.deleteDish(dishId);

      if (result) {
        fetchProfile();
        handleBackToProfile();
      toast.success('Dish deleted successfully!');
      } else {
      toast.error('Failed to delete dish.');
      }
    } catch (error) {
    toast.error('An error occurred while deleting dish.');
    }
  }
  async function handleDeleteMeal(mealId: any) {
    try {
      const { apiService } = await import('../api/api');
      const result = await apiService.deleteMealPlan(mealId);

      if (result) {
        fetchProfile();
        handleBackToProfile();
      toast.success('Meal deleted successfully!');
      } else {
      toast.error('Failed to delete meal.');
      }
    } catch (error) {
    toast.error('An error occurred while deleting meal.');
    }
  }

  const handleSubmit = async (formData: any) => {
    setUpdating(true);
    try {
      const { apiService } = await import('../api/api');
      const response = await apiService.updateUserProfile(formData);
      setProfileData(formData);
      setShowModal(false);
    } catch (error) {
    toast.success('Profile updated successfully!');
    toast.error('Something went wrong. Please try again.');
    } finally {
      setUpdating(false);
    }
  };



  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const navigateToMeals = () => {
    setShowMealsComponent(true);
  };

  const navigateToRecipes = () => {
    setShowRecipeComponent(true);
  };

  const handleBackToProfile = () => {
    setShowMealsComponent(false);
    setShowRecipeComponent(false);
  };

  const formatValue = (value: any) => {
    if (!value) return 'Not set';
    return value.split(' ').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (showMealsComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToProfile}
              className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </button>
          </div>
          <MealsComponent
            data={mealsData}
            loading={false}
            onDelete={handleDeleteMeal}
            title="My Meal Plans"
            subtitle="Track your daily nutrition"
          />
        </div>
      </div>
    );
  }

  if (showRecipeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToProfile}
              className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </button>
          </div>
          <RecipeComponent
            data={recipeData}
            loading={false}
            onDelete={handleDeleteDish}
            title="My Recipes"
            subtitle="My Generated Recipes"
          />
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navbar />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 border border-emerald-100">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full lg:w-auto">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {profileData.name || 'Welcome'}
                  </h1>
                  <p className="text-gray-600 text-base sm:text-lg">Health Profile Dashboard</p>
                  <div className="flex items-center justify-center sm:justify-start mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      <Heart className="w-4 h-4 mr-1" />
                      {formatValue(profileData.healthGoal)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={openModal}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto lg:w-auto"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Update Profile
              </button>
            </div>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


            {/* Weight & Height Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profileData.weight ? `${profileData.weight} kg` : '--'}
                </p>
                <p className="text-sm text-gray-500">
                  Height: {profileData.height ? `${profileData.height} cm` : '--'}
                </p>
              </div>
            </div>

            {/* Activity Level Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Activity Level</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatValue(profileData.activityLevel)}
                </p>
                <p className="text-sm text-gray-500">
                  Age: {profileData.age ? `${profileData.age} years` : '--'}
                </p>
              </div>
            </div>

            {/* Daily Calories Card */}
            {mealsData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-red-600" />
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mealsData[0].total_calories}
                  </p>
                  <p className="text-sm text-gray-500">Total for today</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Gender</p>
                  <p className="text-lg text-gray-900 font-medium">
                    {formatValue(profileData.gender)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Health Goal</p>
                  <p className="text-lg text-gray-900 font-medium">
                    {formatValue(profileData.healthGoal)}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Dietary Preference</p>
                  <p className="text-lg text-gray-900 font-medium">
                    {formatValue(profileData.dietaryPreferance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Activity Level</p>
                  <p className="text-lg text-gray-900 font-medium">
                    {formatValue(profileData.activityLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritionist Professional Information */}
          {profileData.role === 'NUTRITIONIST' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8 mb-8 border border-emerald-200">
              <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">Qualifications</p>
                    <p className="text-lg text-emerald-900 font-medium">
                      {profileData.qualifications || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">Specialization</p>
                    <p className="text-lg text-emerald-900 font-medium">
                      {profileData.specialization || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">Years of Experience</p>
                    <p className="text-lg text-emerald-900 font-medium">
                      {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">Certifications</p>
                    <div className="text-lg text-emerald-900 font-medium">
                      {profileData.certifications && profileData.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profileData.certifications.map((cert: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                              {cert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No certifications listed'
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">Bio</p>
                    <p className="text-lg text-emerald-900 font-medium">
                      {profileData.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={navigateToMeals}
              className="group bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-orange-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <div className="text-orange-200 group-hover:text-orange-400 transition-colors">
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Meal Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                View and manage your personalized meal plans tailored to your health goals and dietary preferences.
              </p>
              <div className="mt-4 text-sm text-orange-600 font-medium">
                {mealsData.length} meal plans available
              </div>
            </div>

            <div
              onClick={navigateToRecipes}
              className="group bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-red-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-red-200 group-hover:text-red-400 transition-colors">
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recipes</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover delicious recipes tailored to your dietary preferences and nutritional requirements.
              </p>
              <div className="mt-4 text-sm text-red-600 font-medium">
                {recipeData.length} recipes available
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileUpdateModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={profileData}
        isLoading={updating}
        title="Update Profile"
        subtitle="Keep your health profile up to date for better recommendations."
      />
    </div>
  );
}

export default HealthProfile;