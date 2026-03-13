"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { Category } from "@/lib/types";
import { createCategory, updateCategory } from "@/lib/data";
import { useAuth } from "@clerk/nextjs";

interface CategoryFormProps {
    initialData?: Category | null;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [name, setName] = useState(initialData?.name || "");
    const [isActive, setIsActive] = useState(initialData?.active ?? true);
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!initialData;

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const token = await getToken();
            let result;
            if (isEditing && initialData?.id) {
                result = await updateCategory(initialData.id, {
                    name,
                    active: isActive
                }, token ?? undefined);
            } else {
                result = await createCategory({
                    name,
                    active: isActive
                }, token ?? undefined);
            }

            if (result) {
                router.push("/admin/categories");
                router.refresh();
            } else {
                alert("Erro ao salvar categoria. Verifique o console.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro inesperado ao salvar categoria.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Dados da Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Categoria</label>
                    <Input
                        placeholder="Ex: Informática"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="active"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={isLoading}
                    />
                    <label htmlFor="active" className="text-sm font-medium cursor-pointer">Categoria Ativa</label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href="/admin/categories">
                    <Button variant="outline" disabled={isLoading}>Cancelar</Button>
                </Link>
                <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Salvar Alterações" : "Salvar Categoria"}
                </Button>
            </CardFooter>
        </Card>
    );
}
