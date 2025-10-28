


import React, { useState } from 'react';
import { Clock, Users, ChefHat, Utensils, Calendar, ChevronDown, ChevronUp, Star, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import EmeraldLoader from './loader';
import { useNavigate } from 'react-router-dom';

export default function RecipeComponent({
    data = [],
    loading = false,
    title = "My Recipes",
    subtitle = "Manage your recipes",
    onDelete = (id) => { }, }) {
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(new Set());
    const navigate = useNavigate();
    const toggleCard = (mealId:any) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mealId)) {
                newSet.delete(mealId);
            } else {
                newSet.add(mealId);
            }
            return newSet;
        });
    };



    const handleDeleteClick = (meal) => {
        setDeleteConfirmation(meal);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation) return;

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

    if (loading) {
        return (
            <>
                <EmeraldLoader />
                <div className="max-w-7xl mx-auto p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const getMealTypeColor = (type) => {
        switch (type) {
            case 'breakfast': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'lunch': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'snack': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMealTypeIcon = (type) => {
        switch (type) {
            case 'breakfast': return '🌅';
            case 'lunch': return '☀️';
            case 'dinner': return '🌙';
            case 'snack': return '🍎';
            default: return '🍽️';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <ChefHat className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        <p className="text-gray-600">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {data.length} recipes
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Professional collection
                    </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((meal) => {
                    const isExpanded = expandedCards.has(meal._id);
                    const isBeingDeleted = isDeleting.has(meal._id);

                    return (
                        <div key={meal._id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden ${isBeingDeleted ? 'opacity-50' : ''}`}>
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">{meal.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getMealTypeColor(meal.meal_type)}`}>
                                                {getMealTypeIcon(meal.meal_type)} {meal.meal_type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick(meal)}
                                        disabled={isBeingDeleted}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete recipe"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{meal.description}</p>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{meal.servings}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ChefHat className="w-4 h-4" />
                                        <span>{meal.cuisine_type}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Utensils className="w-4 h-4" />
                                        <span>{meal.ingredients.length} items</span>
                                    </div>
                                </div>

                                {/* Nutrition Summary */}
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-lg font-bold text-orange-600">{meal.calories}</div>
                                        <div className="text-xs text-gray-500">Cal</div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-lg font-bold text-blue-600">{meal.protein}g</div>
                                        <div className="text-xs text-gray-500">Protein</div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-lg font-bold text-green-600">{meal.carbs}g</div>
                                        <div className="text-xs text-gray-500">Carbs</div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-lg font-bold text-purple-600">{meal.fat}g</div>
                                        <div className="text-xs text-gray-5">Fat</div>
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => toggleCard(meal._id)}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 font-medium"
                                >
                                    {isExpanded ? (
                                        <>
                                            <span>Hide Details</span>
                                            <ChevronUp className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            <span>View Details</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Expandable Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                    {/* Tags */}
                                    <div className="p-6 border-b border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {meal.tags.map((tag, index) => (
                                                <span key={index} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div className="p-6 border-b border-gray-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                            <Utensils className="w-4 h-4" />
                                            Ingredients ({meal.ingredients.length})
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {meal.ingredients.map((ingredient, index) => (
                                                <div key={index} className="text-sm text-gray-600 flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                                                    <span className="text-orange-400 mt-1">•</span>
                                                    <span>{ingredient}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="p-6 border-b border-gray-100">
                                        <h4 className="font-semibeable text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                            <Clock className="w-4 h-4" />
                                            Instructions ({meal.instructions.length} steps)
                                        </h4>
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {meal.instructions.map((instruction, index) => (
                                                <div key={index} className="text-sm text-gray-600 flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <span className="bg-blue-100 text-blue-800 font-semibold min-w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                                        {index + 1}
                                                    </span>
                                                    <span>{instruction}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-6 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                <span>Created: {new Date(meal.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Star className="w-3 h-3" />
                                                <span>Recipe</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
                        <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <ChefHat className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipes found</h3>
                        <p className="text-gray-600 mb-4">Start building your culinary collection!</p>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            onClick={() => { navigate("/dashboard") }}

                        >
                            Add Your First Recipe
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}