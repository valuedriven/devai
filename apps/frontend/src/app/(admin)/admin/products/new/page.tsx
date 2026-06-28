import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getCategories } from "@/lib/data";

import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    const categories = await getCategories(undefined, token);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-3xl font-bold">Novo Produto</h1>
            </div>

            <ProductForm categories={categories} />
        </div>
    );
}
