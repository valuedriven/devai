import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getProduct, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";

interface EditProductPageProps {
    params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    const [product, categories] = await Promise.all([
        getProduct(id),
        getCategories()
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-3xl font-bold">Editar Produto</h1>
            </div>

            <ProductForm categories={categories} initialData={product} />
        </div>
    );
}
