

import React, { useState, useEffect } from 'react';
import { Users, BarChart3, AlertCircle, Search, Filter, Plus, RefreshCw, Utensils, ChefHat, Menu, X } from 'lucide-react';
import AdminMealsCard from '../components/MealCard';
import AdminDishCard from '../components/DishCard';
import AdminUserCard from '../components/UserCard';
import CreateUserModal from '../components/CreateUserModal';

// Define User type based on API response
interface User {
  _id: string;
  email: string;
  password: string;
  role: string;
  __v: number;
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  dietaryPreferance?: string;
  healthGoal?: string;
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
  _id?: string;
  date: string;
  breakfast_dish_id: MealInfo;
  lunch_dish_id: MealInfo;
  dinner_dish_id: MealInfo;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  userId?: string;
}

const Dash: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMealType, setFilterMealType] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboard stats with real data
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDishes: 0,
    totalMeals: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.getAllUsers();

      if (response.meta.status === 200 && response.data) {
        setUsers(response.data);
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: response.data.length
        }));


      } else {
        setError(response.meta.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error fetching users:', err);
    }
  };

  const fetchDishes = async () => {
    try {
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.getAllDishes();

      if (response.meta.status === 200 && response.data) {
        setDishes(response.data);
        setDashboardStats(prev => ({
          ...prev,
          totalDishes: response.data.length
        }));
      } else {
        setError(response.meta.message || 'Failed to fetch dishes');
      }
    } catch (err) {
      setError('Error fetching dishes');
      console.error('Error fetching dishes:', err);
    }
  };

  const fetchMeals = async () => {
    try {
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.getAllMeals();

      if (response && response.data) {
        setMeals(response.data);
        setDashboardStats(prev => ({
          ...prev,
          totalMeals: response.data.length
        }));
      } else {
        setError(response.meta.message || 'Failed to fetch meals');
      }
    } catch (err) {
      setError('Error fetching meals');
      console.error('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUsers = async (id: any) => {
    try {
      setLoading(true);
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.deleteUser(id);

      if (response.meta.status === 200 && response.data) {
        refreshData()
        setLoading(false)
      } else {
        setError(response.meta.message || 'Failed to delete users');
      }
    } catch (err) {
      setError('Error delete users');
      console.error('Error delete users:', err);
    }
  };

  const deleteMeals = async (id: any) => {
    try {
      setLoading(true);
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.deleteMealPlan(id);

      if (response.meta.status === 200 && response.data) {
        refreshData()
        setLoading(false)
      } else {
        setError(response.meta.message || 'Failed to delete users');
      }
    } catch (err) {
      setError('Error delete users');
      console.error('Error delete users:', err);
    }
  };

  const deleteDishes = async (id: any) => {
    try {
      setLoading(true);
      const { apiService } = await import('../../api/api');
      const response: any = await apiService.deleteDish(id);

      if (response.meta.status === 200 && response.data) {
        refreshData()
        setLoading(false)
      } else {
        setError(response.meta.message || 'Failed to delete users');
      }
    } catch (err) {
      setError('Error delete users');
      console.error('Error delete users:', err);
    }
  };

  const updateUser = async (id: any, formData: any) => {
    try {
      const { apiService } = await import('../../api/api');
      const response = await apiService.updateUserAdmin(id, formData);
      if (response) {
        refreshData()
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Something went wrong. Please try again.');
    } finally {
    }
  };

  const createUser = async (formData: any) => {
    const { apiService } = await import('../../api/api');
    try {
      const response = await apiService.register(formData);
      if (response) {
        refreshData()
        setCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Something went wrong. Please try again.');
    } finally {
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUsers(), fetchDishes(), fetchMeals()]);
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMealType = filterMealType === 'all' || dish.meal_type === filterMealType;
    return matchesSearch && matchesMealType;
  });

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.breakfast_dish_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.lunch_dish_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.dinner_dish_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchUsers(), fetchDishes(), fetchMeals()]);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'dishes', label: 'Dishes', icon: ChefHat },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-emerald-600"></div>
            <div className="text-lg sm:text-xl text-gray-400">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg mx-4 max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
            <div className="text-lg sm:text-xl text-red-400 mb-4">Error Loading Dashboard</div>
            <div className="text-gray-400 mb-6 text-sm sm:text-base">{error}</div>
            <button
              onClick={refreshData}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 mx-auto text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 sm:p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm sm:text-base hidden sm:block">Manage your nutrition platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={refreshData}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-800 border-b border-gray-700">
          <div className="px-4 py-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navigation Tabs */}
      <div className="hidden sm:block bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardStats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-900/20 p-2 sm:p-3 rounded-full">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Dishes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardStats.totalDishes}</p>
                  </div>
                  <div className="bg-green-900/20 p-2 sm:p-3 rounded-full">
                    <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Meals</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardStats.totalMeals}</p>
                  </div>
                  <div className="bg-orange-900/20 p-2 sm:p-3 rounded-full">
                    <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4 sm:space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">User Management</h2>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base"
                onClick={() => setCreateModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Role
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Health Goal
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Activity Level
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredUsers.map((data) => (
                      <AdminUserCard key={data._id} user={data} onDelete={deleteUsers} onUpdate={updateUser} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dishes' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Dishes Management Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Dishes Management</h2>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterMealType}
                    onChange={(e) => setFilterMealType(e.target.value)}
                    className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                  >
                    <option value="all">All Meal Types</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDishes.map((data) => (
                <AdminDishCard key={data._id} dish={data} onDelete={deleteDishes} />
              ))}
            </div>

            {filteredDishes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">No dishes found</h3>
                <p className="text-gray-400 text-sm sm:text-base">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Meals Management Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Meal Plans Management</h2>
            </div>

            {/* Search */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meal plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredMeals.map((data) => (
                <AdminMealsCard key={data._id} meal={data} onDelete={deleteMeals} />
              ))}
            </div>

            {filteredMeals.length === 0 && (
              <div className="text-center py-12">
                <Utensils className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">No meal plans found</h3>
                <p className="text-gray-400 text-sm sm:text-base">Try adjusting your search or create a new meal plan</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModal && (
        <CreateUserModal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          onSubmit={createUser}
          title="Create New User"
          subtitle="Add a new user to the platform."
        />
      )}
    </div>
  );
};

export default Dash;