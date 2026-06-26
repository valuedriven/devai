"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@/lib/types";
import { CategoryTable } from "@/components/admin/categories/category-table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { deleteCategoryAction, updateCategoryAction } from "@/lib/actions";
import { useInternalAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface CategoryManagerProps {
    initialData: Category[];
    total: number;
    currentPage: number;
    limit: number;
    includeInactive: boolean;
}

export function CategoryManager({ initialData, total, currentPage, limit, includeInactive }: CategoryManagerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { token } = useInternalAuth();
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

    const toggleInactive = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (includeInactive) {
            params.delete("includeInactive");
        } else {
            params.set("includeInactive", "true");
        }
        params.set("page", "1"); // reset to page 1 on filter change
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteCategory) return;
        const success = await deleteCategoryAction(deleteCategory.id, token || undefined);
        if (success) {
            router.refresh();
        } else {
            alert("Erro ao excluir categoria.");
        }
        setDeleteCategory(null);
    };

    const handleRestore = async (category: Category) => {
        if (!token) return;
        try {
            await updateCategoryAction(category.id, { active: true }, token);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Erro ao restaurar categoria.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="show-inactive"
                        checked={includeInactive}
                        onChange={toggleInactive}
                        className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="show-inactive" className="text-sm cursor-pointer">Mostrar inativos</label>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            <CategoryTable 
                categories={initialData} 
                onEdit={setEditCategory}
                onDelete={setDeleteCategory}
                onRestore={handleRestore}
                showInactiveToggle={includeInactive}
            />

            <Pagination total={total} limit={limit} currentPage={currentPage} />

            <DeleteConfirmDialog
                isOpen={!!deleteCategory}
                onClose={() => setDeleteCategory(null)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar exclusão"
                message={`Tem certeza que deseja excluir a categoria "${deleteCategory?.name}"?`}
            />

            {/* We will modify CategoryForm to handle its own dialog logic or we wrap it here */}
            {/* I will add an isOpen prop to CategoryForm later, for now let's wrap it in a modal div */}
            {(isCreateOpen || editCategory) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setIsCreateOpen(false); setEditCategory(null); }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                        <CategoryForm 
                            initialData={editCategory} 
                            onSuccess={() => { setIsCreateOpen(false); setEditCategory(null); }} 
                            onCancel={() => { setIsCreateOpen(false); setEditCategory(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
