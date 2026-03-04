"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Edit, Trash } from "lucide-react";
import { deleteCustomer } from "@/lib/data";

interface CustomerActionsProps {
    id: string;
}

export function CustomerActions({ id }: CustomerActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

        setIsDeleting(true);
        try {
            await deleteCustomer(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir cliente.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Link href={`/admin/customers/${id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                <Edit className="h-4 w-4" />
            </Link>
            <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
}
