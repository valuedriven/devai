"use client";

import { X, AlertTriangle } from "lucide-react";
import { Category } from "@/types/models";

interface DeleteConfirmDialogProps {
  category: Category;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  category,
  onConfirm,
  onClose,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Delete Category</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to delete this category?
              </p>
              <p className="font-medium text-gray-900">
                &ldquo;{category.name}&rdquo;
              </p>
              {!category.active && (
                <p className="mt-1 text-xs text-gray-500">
                  This category is already inactive.
                </p>
              )}
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            The category will be hidden from customers but can be restored later.
          </p>
          
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}