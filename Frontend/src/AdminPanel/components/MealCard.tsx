

import { Eye, Edit, Trash2, Utensils, X, Clock, Users, Flame } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationModal } from './DeleteModal';

function DishDetailModal({ dish, isOpen, onClose }) {
    if (!isOpen) return null;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-900/20 text-green-400';
            case 'medium':
                return 'bg-yellow-900/20 text-yellow-400';
            case 'hard':
                return 'bg-red-900/20 text-red-400';
            default:
                return 'bg-gray-900/20 text-gray-400';
        }
    };

    const getMealTypeColor = (mealType) => {
        switch (mealType?.toLowerCase()) {
            case 'breakfast':
                return 'bg-orange-900/20 text-orange-400';
            case 'lunch':
                return 'bg-blue-900/20 text-blue-400';
            case 'dinner':
                return 'bg-purple-900/20 text-purple-400';
            case 'snack':
                return 'bg-green-900/20 text-green-400';
            default:
                return 'bg-gray-900/20 text-gray-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <div className="relative w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl mx-2 sm:mx-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                        <h2 className="text-xl sm:text-2xl font-bold text-white pr-4">{dish.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-300 flex-shrink-0"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Description</h3>
                                    <p className="text-gray-400 text-sm sm:text-base">{dish.description}</p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getMealTypeColor(dish.meal_type)}`}>
                                            {dish.meal_type}
                                        </span>
                                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getDifficultyColor(dish.difficulty_level)}`}>
                                            {dish.difficulty_level}
                                        </span>
                                        {dish.is_vegetarian && (
                                            <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-green-900/20 text-green-400">
                                                Vegetarian
                                            </span>
                                        )}
                                        {dish.is_vegan && (
                                            <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-emerald-900/20 text-emerald-400">
                                                Vegan
                                            </span>
                                        )}
                                        {dish.cuisine && (
                                            <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-indigo-900/20 text-indigo-400">
                                                {dish.cuisine}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                                        Ingredients ({dish.ingredients?.length || 0})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {dish.ingredients?.map((ingredient, index) => (
                                            <div key={index} className="flex items-center">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="text-gray-300 capitalize text-sm sm:text-base">{ingredient}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructions */}
                                {dish.instructions && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Instructions</h3>
                                        <ol className="space-y-2 sm:space-y-3">
                                            {dish.instructions.map((instruction, index) => (
                                                <li key={index} className="flex">
                                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full flex items-center justify-center mr-3">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-gray-300 text-sm sm:text-base">{instruction}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Stats */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Nutrition */}
                                <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Nutrition (per serving)</h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between text-sm sm:text-base">
                                            <span className="text-gray-400">Calories:</span>
                                            <span className="font-medium text-white">{dish.calories}</span>
                                        </div>
                                        <div className="flex justify-between text-sm sm:text-base">
                                            <span className="text-gray-400">Protein:</span>
                                            <span className="font-medium text-white">{dish.protein}g</span>
                                        </div>
                                        {dish.nutritional_info && (
                                            <>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-400">Carbs:</span>
                                                    <span className="font-medium text-white">{dish.nutritional_info.carbs}g</span>
                                                </div>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-400">Fat:</span>
                                                    <span className="font-medium text-white">{dish.nutritional_info.fat}g</span>
                                                </div>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-400">Fiber:</span>
                                                    <span className="font-medium text-white">{dish.nutritional_info.fiber}g</span>
                                                </div>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-400">Sodium:</span>
                                                    <span className="font-medium text-white">{dish.nutritional_info.sodium}mg</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Allergens */}
                                {dish.allergens && dish.allergens.length > 0 && (
                                    <div className="bg-red-900/20 rounded-lg p-3 sm:p-4">
                                        <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2">Allergens</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {dish.allergens.map((allergen, index) => (
                                                <span key={index} className="px-2 py-1 text-xs font-medium bg-red-900/40 text-red-400 rounded">
                                                    {allergen}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminMealsCard({
    meal,
    onDelete
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete(meal._id);
        setShowDeleteModal(false);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const handleViewDishDetails = (dish) => {
        setSelectedDish(dish);
        setIsDishModalOpen(true);
    };

    const closeDishModal = () => {
        setIsDishModalOpen(false);
        setSelectedDish(null);
    };

    const handleViewDetails = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const MealDetailSection = ({ title, dish, bgColor, borderColor, iconColor, onViewDetails }) => (
        <div className={`${bgColor} rounded-lg p-4 sm:p-6 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className={`bg-opacity-20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 ${iconColor.replace('text-', 'bg-')}`}>
                        <Utensils className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
                    </div>
                    <h3 className={`text-base sm:text-lg font-semibold ${iconColor}`}>
                        {title}
                    </h3>
                </div>
                {dish && (
                    <button
                        onClick={() => onViewDetails(dish)}
                        className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-gray-700 flex-shrink-0"
                        title="View details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                )}
            </div>

            {dish ? (
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <h4 className="font-semibold text-white text-base sm:text-lg mb-2">
                            {dish.name}
                        </h4>
                        <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                            {dish.description}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-500 mb-2">
                        <Utensils className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">No {title.toLowerCase()} planned</p>
                </div>
            )}
        </div>
    );

    return (
        <>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                userName={meal.name}
            />
            <div key={meal._id} className="text-white bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                Meal Plan - {new Date(meal.plan_date).toLocaleDateString()}
                            </h3>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                                <span>Total Calories: <span className="font-medium text-white">{meal.total_calories}</span></span>
                                <span>Protein: <span className="font-medium text-white">{meal.total_protein}g</span></span>
                                <span>Carbs: <span className="font-medium text-white">{meal.total_carbs}g</span></span>
                                <span>Fat: <span className="font-medium text-white">{meal.total_fat}g</span></span>
                            </div>
                        </div>
                        <div className="flex space-x-2 self-start sm:self-auto">
                            <button
                                className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-gray-700"
                                onClick={handleViewDetails}
                                title="View Details"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-700"
                                onClick={handleDelete}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Breakfast */}
                        <div className="bg-orange-900/10 rounded-lg p-3 sm:p-4 border border-orange-800">
                            <div className="flex items-center mb-3">
                                <div className="bg-orange-900/20 p-2 rounded-full mr-3">
                                    <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                                </div>
                                <h4 className="font-medium text-orange-300 text-sm sm:text-base">Breakfast</h4>
                            </div>
                            <h5 className="font-medium text-white mb-2 text-sm sm:text-base">{meal.breakfast_dish_id?.name || 'No breakfast'}</h5>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                                {meal.breakfast_dish_id?.description || 'No description'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400">Calories:</span>
                                    <span className="ml-1 font-medium text-white">{meal.breakfast_dish_id?.calories || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Protein:</span>
                                    <span className="ml-1 font-medium text-white">{meal.breakfast_dish_id?.protein || 0}g</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Servings:</span>
                                    <span className="ml-1 font-medium text-white">{meal.breakfast_dish_id?.servings || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Lunch */}
                        <div className="bg-blue-900/10 rounded-lg p-3 sm:p-4 border border-blue-800">
                            <div className="flex items-center mb-3">
                                <div className="bg-blue-900/20 p-2 rounded-full mr-3">
                                    <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                </div>
                                <h4 className="font-medium text-blue-300 text-sm sm:text-base">Lunch</h4>
                            </div>
                            <h5 className="font-medium text-white mb-2 text-sm sm:text-base">{meal.lunch_dish_id?.name || 'No lunch'}</h5>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                                {meal.lunch_dish_id?.description || 'No description'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400">Calories:</span>
                                    <span className="ml-1 font-medium text-white">{meal.lunch_dish_id?.calories || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Protein:</span>
                                    <span className="ml-1 font-medium text-white">{meal.lunch_dish_id?.protein || 0}g</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Servings:</span>
                                    <span className="ml-1 font-medium text-white">{meal.lunch_dish_id?.servings || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dinner */}
                        <div className="bg-purple-900/10 rounded-lg p-3 sm:p-4 border border-purple-800">
                            <div className="flex items-center mb-3">
                                <div className="bg-purple-900/20 p-2 rounded-full mr-3">
                                    <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                                </div>
                                <h4 className="font-medium text-purple-300 text-sm sm:text-base">Dinner</h4>
                            </div>
                            <h5 className="font-medium text-white mb-2 text-sm sm:text-base">{meal.dinner_dish_id?.name || 'No dinner'}</h5>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                                {meal.dinner_dish_id?.description || 'No description'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400">Calories:</span>
                                    <span className="ml-1 font-medium text-white">{meal.dinner_dish_id?.calories || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Protein:</span>
                                    <span className="ml-1 font-medium text-white">{meal.dinner_dish_id?.protein || 0}g</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Servings:</span>
                                    <span className="ml-1 font-medium text-white">{meal.dinner_dish_id?.servings || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
                        <div className="top-0 bg-gray-800 border-b border-gray-700 p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                                <div className="pr-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                                        Meal Plan Details
                                    </h2>
                                    <p className="text-gray-400 mt-1 text-sm sm:text-base">
                                        {new Date(meal.plan_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-300 flex-shrink-0"
                                >
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </div>

                            {/* Total Nutrition Summary */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                                <div className="bg-red-900/10 rounded-lg p-2 sm:p-3 text-center">
                                    <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mx-auto mb-1" />
                                    <div className="text-xs sm:text-sm text-gray-400">Total Calories</div>
                                    <div className="font-semibold text-white text-sm sm:text-base">{meal.total_calories}</div>
                                </div>
                                <div className="bg-green-900/10 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full mx-auto mb-1"></div>
                                    <div className="text-xs sm:text-sm text-gray-400">Total Protein</div>
                                    <div className="font-semibold text-white text-sm sm:text-base">{meal.total_protein}g</div>
                                </div>
                                <div className="bg-yellow-900/10 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                                    <div className="text-xs sm:text-sm text-gray-400">Total Carbs</div>
                                    <div className="font-semibold text-white text-sm sm:text-base">{meal.total_carbs}g</div>
                                </div>
                                <div className="bg-blue-900/10 rounded-lg p-2 sm:p-3 text-center">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full mx-auto mb-1"></div>
                                    <div className="text-xs sm:text-sm text-gray-400">Total Fat</div>
                                    <div className="font-semibold text-white text-sm sm:text-base">{meal.total_fat}g</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                            <MealDetailSection
                                title="Breakfast"
                                dish={meal.breakfast_dish_id}
                                bgColor="bg-orange-900/10"
                                borderColor="border-orange-800"
                                iconColor="text-orange-400"
                                onViewDetails={handleViewDishDetails}
                            />

                            <MealDetailSection
                                title="Lunch"
                                dish={meal.lunch_dish_id}
                                bgColor="bg-blue-900/10"
                                borderColor="border-blue-800"
                                iconColor="text-blue-400"
                                onViewDetails={handleViewDishDetails}
                            />

                            <MealDetailSection
                                title="Dinner"
                                dish={meal.dinner_dish_id}
                                bgColor="bg-purple-900/10"
                                borderColor="border-purple-800"
                                iconColor="text-purple-400"
                                onViewDetails={handleViewDishDetails}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Dish Detail Modal */}
            <DishDetailModal
                dish={selectedDish}
                isOpen={isDishModalOpen}
                onClose={closeDishModal}
            />
        </>
    );
}