


import { useState } from 'react';
import { Eye, Trash2, X } from 'lucide-react';



// Delete Modal Component
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, userName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-gray-800 rounded-lg shadow-xl">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Delete {userName}?</h3>
                        <p className="text-gray-400 mb-6">This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DishDetailModal({ dish, isOpen, onClose }) {
    if (!isOpen) return null;

    const getDifficultyColor = (difficulty: any) => {
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

    const getMealTypeColor = (mealType: any) => {
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
                <div className="relative w-full max-w-6xl bg-gray-800 rounded-lg shadow-xl m-2 sm:m-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                        <h2 className="text-lg sm:text-2xl font-bold text-white pr-4">{dish.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-300 flex-shrink-0"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                            {/* Left Column - Main Info */}
                            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Description</h3>
                                    <p className="text-sm sm:text-base text-gray-400">{dish.description}</p>
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
                                        {dish.ingredients?.map((ingredient: any, index: any) => (
                                            <div key={index} className="flex items-center">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 flex-shrink-0"></span>
                                                <span className="text-sm sm:text-base text-gray-300 capitalize">{ingredient}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructions */}
                                {dish.instructions && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Instructions</h3>
                                        <ol className="space-y-2 sm:space-y-3">
                                            {dish.instructions.map((instruction: any, index: any) => (
                                                <li key={index} className="flex">
                                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-sm sm:text-base text-gray-300">{instruction}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Stats */}
                            <div className="space-y-4 sm:space-y-6">

                                {/* Nutrition */}
                                <div className="bg-gray-900/50 rounded-lg p-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Nutrition (per serving)</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm sm:text-base text-gray-400">Calories:</span>
                                            <span className="text-sm sm:text-base font-medium text-white">{dish.calories}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm sm:text-base text-gray-400">Protein:</span>
                                            <span className="text-sm sm:text-base font-medium text-white">{dish.protein}g</span>
                                        </div>
                                        {dish.nutritional_info && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm sm:text-base text-gray-400">Carbs:</span>
                                                    <span className="text-sm sm:text-base font-medium text-white">{dish.nutritional_info.carbs}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm sm:text-base text-gray-400">Fat:</span>
                                                    <span className="text-sm sm:text-base font-medium text-white">{dish.nutritional_info.fat}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm sm:text-base text-gray-400">Fiber:</span>
                                                    <span className="text-sm sm:text-base font-medium text-white">{dish.nutritional_info.fiber}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm sm:text-base text-gray-400">Sodium:</span>
                                                    <span className="text-sm sm:text-base font-medium text-white">{dish.nutritional_info.sodium}mg</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminDishCard({ dish, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete(dish._id);
        setShowDeleteModal(false);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const handleViewDetails = () => {
        setIsModalOpen(true);
    };

    const getDifficultyColor = (difficulty: any) => {
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

    const getMealTypeColor = (mealType: any) => {
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
        <>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                userName={dish.name}
            />
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white pr-2">{dish.name}</h3>
                        <div className="flex space-x-1 flex-shrink-0">
                            <button
                                onClick={handleViewDetails}
                                className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-gray-700"
                                title="View details"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-700"
                                onClick={handleDelete}
                                title="Delete dish"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 sm:line-clamp-none">{dish.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMealTypeColor(dish.meal_type)}`}>
                            {dish.meal_type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(dish.difficulty_level)}`}>
                            {dish.difficulty_level}
                        </span>
                        {dish.is_vegetarian && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/20 text-green-400">
                                Vegetarian
                            </span>
                        )}
                        {dish.is_vegan && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-900/20 text-emerald-400">
                                Vegan
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-400 text-xs sm:text-sm">Calories:</span>
                            <span className="font-medium text-white sm:ml-1">{dish.calories}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-400 text-xs sm:text-sm">Protein:</span>
                            <span className="font-medium text-white sm:ml-1">{dish.protein}g</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-400 text-xs sm:text-sm">Servings:</span>
                            <span className="font-medium text-white sm:ml-1">{dish.servings}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Ingredients ({dish.ingredients?.length || 0}):</p>
                        <p className="text-xs text-gray-400 line-clamp-2">
                            {dish.ingredients?.slice(0, 3).join(', ')}{dish.ingredients?.length > 3 ? '...' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <DishDetailModal
                dish={dish}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}