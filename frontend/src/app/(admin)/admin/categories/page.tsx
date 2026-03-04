import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCategories } from "@/lib/data";
import { deleteCategoryAction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Category } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
    const search = (await searchParams).search ?? '';
    const categories = await getCategories(search);


    const columns: Column<Category>[] = [
        {
            header: "Nome",
            accessor: "name",
            className: "font-medium",
        },
        {
            header: "Status",
            cell: (category) => (
                <Badge tone={category.active ? "success" : "neutral"}>
                    {category.active ? "Ativo" : "Inativo"}
                </Badge>
            ),
        },
        {
            header: "Ações",
            align: "right",
            cell: (category) => (
                <AdminActions
                    id={category.id}
                    editHref={`/admin/categories/${category.id}/edit`}
                    deleteAction={deleteCategoryAction}
                    deleteConfirmMessage={`Tem certeza que deseja excluir a categoria "${category.name}"?`}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Categorias</h1>
                <Link href="/admin/categories/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Link>
            </div>

            <AdminSearchBar placeholder="Pesquisar categorias..." />

            <AdminDataTable
                columns={columns}
                data={categories}
                keyField="id"
            />
        </div>
    );
}

