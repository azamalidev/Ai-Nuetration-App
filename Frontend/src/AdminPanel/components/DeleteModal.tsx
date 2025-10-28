import { AlertTriangle, Trash2, X } from "lucide-react";

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete <strong>{userName}</strong>?
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex space-x-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};