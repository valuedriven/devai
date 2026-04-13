import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/categories" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-3xl font-bold">Nova Categoria</h1>
            </div>

            <CategoryForm />
        </div>
    );
}
