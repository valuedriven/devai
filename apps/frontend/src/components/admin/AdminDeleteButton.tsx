"use client";

import { useState } from "react";
import { useInternalAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/Button";
import { Trash, Loader2 } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useToast } from "@/components/ui/toast-context";

interface AdminDeleteButtonProps {
    id: string;
    label?: string;
    confirmMessage?: string;
    onDelete: (id: string, token?: string) => Promise<boolean>;
    onSuccess?: () => void;
}

export function AdminDeleteButton({
    id,
    label,
    confirmMessage = "Tem certeza que deseja excluir este item?",
    onDelete,
    onSuccess
}: AdminDeleteButtonProps) {
    const { token } = useInternalAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { addToast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const success = await onDelete(id, token ?? undefined);
            if (success) {
                addToast("Item excluído com sucesso!", "success");
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                addToast("Erro ao excluir item.", "error");
            }
        } catch (error: unknown) {
            console.error("Delete error:", error);
            const err = error as { status?: number; message?: string };
            if (err.status === 409 || err.message?.includes("associated") || err.message?.includes("associado")) {
                addToast("Não é possível excluir o cliente pois ele possui pedidos associados.", "error");
            } else {
                addToast(err.message || "Erro ao excluir item.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setIsDialogOpen(true)}
                disabled={isLoading}
                title={label || "Excluir"}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
            </Button>

            <DeleteConfirmDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleDelete}
                message={confirmMessage}
            />
        </>
    );
}

