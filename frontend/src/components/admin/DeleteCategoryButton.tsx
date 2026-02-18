"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Trash, Loader2 } from "lucide-react";
import { deleteCategory } from "@/lib/data";

interface DeleteCategoryButtonProps {
    id: string;
    name: string;
}

export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await deleteCategory(id);
            if (success) {
                router.refresh();
            } else {
                alert("Erro ao excluir categoria.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro inesperado ao excluir categoria.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
        </Button>
    );
}
