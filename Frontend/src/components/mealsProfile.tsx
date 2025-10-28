import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Flame,
    Clock,
    Users,
    Filter,
    Search,
    ArrowLeft,
    Eye,
    Utensils,
    Trash2,
    AlertTriangle,
    ChefHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MealsComponent({
    data = null,
    loading = false,
    title = "My Meals",
    subtitle = "Manage your meal plans and dishes",
    onDelete = (id) => { },
}) {
    const meals = data || [];
    const [filteredMeals, setFilteredMeals] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [showMealDetails, setShowMealDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(new Set());
    const navigate = useNavigate();

    const handleDeleteClick = (meal) => {
        setDeleteConfirmation(meal);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation) return;
        console.log("deleteConfirmation", deleteConfirmation)

        const mealId = deleteConfirmation._id;
        setIsDeleting(prev => new Set(prev).add(mealId));

        try {
            await onDelete(mealId);

            // Optionally filter out deleted item from local state if needed
            // or use an onDelete callback prop to update parent

            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Error deleting recipe:', error);
        } finally {
            setIsDeleting(prev => {
                const newSet = new Set(prev);
                newSet.delete(mealId);
                return newSet;
            });
        }
    };


    const handleDeleteCancel = () => {
        setDeleteConfirmation(null);
    };

    useEffect(() => {
        let filtered = meals;
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(meal =>
                meal.breakfast_dish_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meal.lunch_dish_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meal.dinner_dish_id?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredMeals(filtered);
    }, [searchTerm, meals]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMealIcon = (mealType) => {
        switch (mealType) {
            case 'breakfast':
                return '🌅';
            case 'lunch':
                return '☀️';
            case 'dinner':
                return '🌙';
            default:
                return '🍽️';
        }
    };

    const showMealDetailsModal = (meal) => {
        setSelectedMeal(meal);
        setShowMealDetails(true);
    };

    const closeMealDetails = () => {
        setShowMealDetails(false);
        setSelectedMeal(null);
    };

    const renderDishCard = (dish, mealType) => {
        if (!dish) return null;

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg">{getMealIcon(mealType)}</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-500 capitalize">{mealType}</span>
                    </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-sm sm:text-base">{dish.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                            <span>{dish.calories} cal</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                            <span>{dish.servings} serving</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                            <span className="hidden sm:inline">{dish.cuisine_type}</span>
                            <span className="sm:hidden">{dish.cuisine_type?.substring(0, 8)}...</span>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs mb-3">
                    <div className="text-center bg-blue-50 rounded px-1 sm:px-2 py-1">
                        <div className="font-medium text-blue-700">{dish.protein}g</div>
                        <div className="text-blue-600 text-[10px] sm:text-xs">Protein</div>
                    </div>
                    <div className="text-center bg-green-50 rounded px-1 sm:px-2 py-1">
                        <div className="font-medium text-green-700">{dish.carbs}g</div>
                        <div className="text-green-600 text-[10px] sm:text-xs">Carbs</div>
                    </div>
                    <div className="text-center bg-orange-50 rounded px-1 sm:px-2 py-1">
                        <div className="font-medium text-orange-700">{dish.fat}g</div>
                        <div className="text-orange-600 text-[10px] sm:text-xs">Fat</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                    {dish.tags && dish.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-1 sm:px-2 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-full">
                            {tag}
                        </span>
                    ))}
                    {dish.tags && dish.tags.length > 2 && (
                        <span className="px-1 sm:px-2 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-full">
                            +{dish.tags.length - 2} more
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    {dish.is_vegan && <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded">Vegan</span>}
                    {dish.is_vegetarian && !dish.is_vegan && <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded">Vegetarian</span>}
                    {dish.is_gluten_free && <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-1 rounded">Gluten-Free</span>}
                    {dish.is_keto && <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-800 px-1 sm:px-2 py-1 rounded">Keto</span>}
                </div>
            </div>
        );
    };

    const renderMealDetailsModal = () => {
        if (!selectedMeal || !showMealDetails) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                                <span className="hidden sm:inline">Meal Plan - </span>
                                {formatDate(selectedMeal.plan_date)}
                            </h2>
                            <button
                                onClick={closeMealDetails}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Daily Nutrition Overview */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Daily Nutrition Summary</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                                <div className="text-center">
                                    <div className="font-semibold text-gray-700">{selectedMeal.total_calories}</div>
                                    <div className="text-gray-500">Total Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-700">{selectedMeal.total_protein}g</div>
                                    <div className="text-gray-500">Protein</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-green-700">{selectedMeal.total_carbs}g</div>
                                    <div className="text-gray-500">Carbs</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-orange-700">{selectedMeal.total_fat}g</div>
                                    <div className="text-gray-500">Fat</div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Meal Cards */}
                        <div className="space-y-4 sm:space-y-6">
                            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                const dish = selectedMeal[`${mealType}_dish_id`];
                                if (!dish) return null;

                                return (
                                    <div key={mealType} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg sm:text-xl">{getMealIcon(mealType)}</span>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">{mealType}</h3>
                                            </div>
                                        </div>

                                        <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">{dish.name}</h4>
                                        <p className="text-gray-600 mb-4 text-sm sm:text-base">{dish.description}</p>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Ingredients</h5>
                                                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                                                    {dish.ingredients.map((ingredient, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <span className="text-emerald-500 mt-1">•</span>
                                                            <span>{ingredient}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Instructions</h5>
                                                <ol className="text-xs sm:text-sm text-gray-600 space-y-2">
                                                    {dish.instructions.map((instruction, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <span className="text-emerald-500 font-medium min-w-[20px] text-xs sm:text-sm">{index + 1}.</span>
                                                            <span>{instruction}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                                <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search meals..."
                                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                            <Filter className="w-4 h-4" />
                            <span>{filteredMeals.length} meal plans found</span>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Recipe</h3>
                                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-2">Are you sure you want to delete this recipe?</p>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-medium text-gray-900">{deleteConfirmation.name}</p>
                                    <p className="text-sm text-gray-600">{deleteConfirmation.description}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting.has(deleteConfirmation._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting.has(deleteConfirmation._id) ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Meals Grid */}
                <div className="space-y-4 sm:space-y-8">
                    {filteredMeals.map((meal) => (
                        <div key={meal._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                            {formatDate(meal.plan_date)}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {meal.total_calories} calories • {meal.total_protein}g protein
                                        </p>
                                    </div>
                                </div>
                                <div>

                                    <button
                                        onClick={() => showMealDetailsModal(meal)}
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(meal)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete recipe"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Meal Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {renderDishCard(meal.breakfast_dish_id, 'breakfast')}
                                {renderDishCard(meal.lunch_dish_id, 'lunch')}
                                {renderDishCard(meal.dinner_dish_id, 'dinner')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Meal Details Modal */}
                {renderMealDetailsModal()}
            </div>


            {data.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
                        <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <ChefHat className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meals found</h3>
                        <p className="text-gray-600 mb-4">Start building your culinary collection!</p>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            onClick={() => { navigate("/dashboard") }}
                        >
                            Add Your First Meal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}