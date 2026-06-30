import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getPaginatedProducts, getCategories } from "@/lib/data";
import { deleteProductAction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Pagination } from "@/components/ui/Pagination";
import { Product } from "@/lib/types";
import { cookies } from "next/headers";

// No client hook needed – use server‑side searchParams
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; categoryId?: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;

    const params = await searchParams;
    const search = params.search ?? '';
    const page = Number(params.page) || 1;
    const categoryId = params.categoryId;
    const limit = 20;
    
    const [productsResult, categories] = await Promise.all([
        getPaginatedProducts({ search, page, limit, categoryId, includeInactive: true }, token),
        getCategories(undefined, token)
    ]);
    const products = productsResult.data;
    const total = productsResult.total;

    const columns: Column<Product>[] = [
        {
            header: "Nome",
            cell: (product) => (
                <div className="flex items-center gap-3 font-medium">
                    <div className="h-10 w-10 flex-shrink-0 rounded bg-muted overflow-hidden relative">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={product.image?.startsWith('http')}
                        />
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
            header: "Categoria",
            cell: (product) => {
                const category = categories.find(c => String(c.id) === String(product.categoryId));
                return category ? category.name : "N/A";
            },
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

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full">
                    <AdminSearchBar placeholder="Pesquisar produtos..." />
                </div>
                <form method="GET" className="flex items-center gap-2">
                    {search && <input type="hidden" name="search" value={search} />}
                    <div className="flex gap-2">
                        <select 
                            name="categoryId" 
                            defaultValue={categoryId || ""} 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button type="submit" className="h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                            Filtrar
                        </button>
                    </div>
                </form>
            </div>

            <AdminDataTable
                columns={columns}
                data={products}
                keyField="id"
            />

            <div className="mt-4 flex justify-end">
                <Pagination
                    currentPage={page}
                    total={total}
                    limit={limit}
                />
            </div>
        </div>
    );
}

