import { cookies } from "next/headers";
import { getPaginatedCategories } from "@/lib/data";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; limit?: string; includeInactive?: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;

    const params = await searchParams;
    const search = params.search ?? '';
    const page = parseInt(params.page ?? '1');
    const limit = parseInt(params.limit ?? '20');
    const includeInactive = params.includeInactive === 'true';

    const { data: categories, total } = await getPaginatedCategories({ search, page, limit, includeInactive }, token);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Categorias</h1>
            </div>

            <AdminSearchBar placeholder="Pesquisar categorias..." />

            <CategoryManager 
                initialData={categories}
                total={total}
                currentPage={page}
                limit={limit}
                includeInactive={includeInactive}
            />
        </div>
    );
}

