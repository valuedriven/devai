import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProducts } from "@/lib/data";
import { deleteProductAction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Product } from "@/lib/types";

// No client hook needed – use server‑side searchParams
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
    const search = (await searchParams).search ?? '';
    const products = await getProducts(search);


    const columns: Column<Product>[] = [
        {
            header: "Nome",
            cell: (product) => (
                <div className="flex items-center gap-3 font-medium">
                    <div className="h-10 w-10 flex-shrink-0 rounded bg-muted overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    {product.name}
                </div>
            ),
        },
        {
            header: "Preço",
            cell: (product) => (
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
            ),
        },
        {
            header: "Estoque",
            accessor: "stock",
        },
        {
            header: "Status",
            cell: (product) => (
                <Badge tone={product.active ? "success" : "neutral"}>
                    {product.active ? "Ativo" : "Inativo"}
                </Badge>
            ),
        },
        {
            header: "Ações",
            align: "right",
            cell: (product) => (
                <AdminActions
                    id={product.id}
                    editHref={`/admin/products/${product.id}/edit`}
                    deleteAction={deleteProductAction}
                    deleteConfirmMessage={`Tem certeza que deseja excluir o produto "${product.name}"?`}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Produtos</h1>
                <Link href="/admin/products/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                </Link>
            </div>

            <AdminSearchBar placeholder="Pesquisar produtos..." />

            <AdminDataTable
                columns={columns}
                data={products}
                keyField="id"
            />
        </div>
    );
}

