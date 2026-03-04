"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { AdminDeleteButton } from "./AdminDeleteButton";

interface AdminActionsProps {
    id: string;
    editHref?: string;
    viewHref?: string;
    deleteAction?: (id: string) => Promise<boolean>;
    deleteConfirmMessage?: string;
}

export function AdminActions({
    id,
    editHref,
    viewHref,
    deleteAction,
    deleteConfirmMessage
}: AdminActionsProps) {
    const router = useRouter();

    return (
        <div className="flex justify-end gap-2">
            {viewHref && (
                <Link href={viewHref} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                </Link>
            )}
            {editHref && (
                <Link href={editHref} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Editar">
                    <Edit className="h-4 w-4" />
                </Link>
            )}
            {deleteAction && (
                <AdminDeleteButton
                    id={id}
                    onDelete={deleteAction}
                    confirmMessage={deleteConfirmMessage}
                    onSuccess={() => router.refresh()}
                    label="Excluir"
                />
            )}
        </div>
    );
}
