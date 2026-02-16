import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCategories } from "@/lib/data";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default async function AdminCategoriesPage() {
    const categories = await getCategories();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Categorias</h1>
                <Link href="/admin/categories/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Pesquisar categorias..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nome</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{category.name}</td>
                                        <td className="p-4 align-middle">
                                            <Badge tone={category.active ? "success" : "neutral"}>
                                                {category.active ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/categories/${category.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
