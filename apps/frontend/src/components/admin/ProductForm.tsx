"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Category, Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/lib/data";
import { useAuth } from "@clerk/nextjs";

interface ProductFormProps {
    categories: Category[];
    initialData?: Product;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price || 0,
        stock: initialData?.stock || 0,
        categoryId: initialData?.categoryId || initialData?.category_id || "",
        description: initialData?.description || "",
        imageUrl: initialData?.image_url || initialData?.image || "",
        active: initialData?.active ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getToken();
            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category_id: formData.categoryId,
                image_url: formData.imageUrl,
                active: formData.active,
                // Compatibility
                image: formData.imageUrl,
                categoryId: formData.categoryId,
            } as Omit<Product, "id">;

            let result;
            if (initialData?.id) {
                result = await updateProduct(initialData.id, productData, token ?? undefined);
            } else {
                result = await createProduct(productData, token ?? undefined);
            }

            if (result) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert("Erro ao salvar produto. Verifique os dados e tente novamente.");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Ocorreu um erro ao salvar o produto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Dados do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do Produto</label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Smartphone X"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço (R$)</label>
                            <Input
                                required
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                placeholder="0,00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estoque</label>
                            <Input
                                required
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoria</label>
                        <select
                            required
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descrição detalhada do produto..."
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">URL da Imagem</label>
                        <Input
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="active" className="text-sm font-medium">Produto Ativo</label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Link href="/admin/products">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
