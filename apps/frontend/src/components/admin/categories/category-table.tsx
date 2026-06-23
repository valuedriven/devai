"use client";

import { Category } from "@/types/models";
import { Pencil, Trash2, RotateCcw } from "lucide-react";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRestore?: (category: Category) => void;
  showInactiveToggle?: boolean;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onRestore,
  showInactiveToggle = false,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No categories found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Slug</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900">{category.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-gray-500 text-sm">{category.slug || "-"}</span>
              </td>
              <td className="py-3 px-4">
                {category.active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="text-gray-500 text-sm">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "-"}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  {showInactiveToggle && !category.active && onRestore && (
                    <button
                      onClick={() => onRestore(category)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Restore category"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}