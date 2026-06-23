"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Category } from "@/types/models";

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: { name: string; active?: boolean }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function CategoryForm({
  category,
  onSubmit,
  onClose,
  isLoading = false,
}: CategoryFormProps) {
  const [name, setName] = useState(() => category?.name ?? "");
  const [active, setActive] = useState(() => category?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    
    if (name.length > 100) {
      setError("Category name must be 100 characters or less");
      return;
    }
    
    try {
      await onSubmit({ 
        name: name.trim(), 
        active: category ? active : true // Only send active for updates
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };
  
  const isEditing = !!category;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}