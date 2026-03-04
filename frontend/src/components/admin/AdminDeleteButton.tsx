"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Trash, Loader2 } from "lucide-react";

interface AdminDeleteButtonProps {
    id: string;
    label?: string;
    confirmMessage?: string;
    onDelete: (id: string) => Promise<boolean>;
    onSuccess?: () => void;
}

export function AdminDeleteButton({
    id,
    label,
    confirmMessage = "Tem certeza que deseja excluir este item?",
    onDelete,
    onSuccess
}: AdminDeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(confirmMessage)) return;

        setIsLoading(true);
        try {
            const success = await onDelete(id);
            if (success && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Erro ao excluir item.");
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
            title={label || "Excluir"}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
        </Button>
    );
}
