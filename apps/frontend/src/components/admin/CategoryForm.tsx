"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { Category } from "@/lib/types";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions";
import { useInternalAuth } from "@/hooks/AuthContext";

interface CategoryFormProps {
    initialData?: Category | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
    const router = useRouter();
    const { token } = useInternalAuth();
    const [name, setName] = useState(initialData?.name || "");
    const [isActive, setIsActive] = useState(initialData?.active ?? true);
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!initialData;

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateCategoryAction(initialData.id, {
                    name,
                    active: isActive
                }, token ?? undefined);
            } else {
                result = await createCategoryAction({
                    name,
                    active: isActive
                }, token ?? undefined);
            }

            if (result) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/categories");
                }
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
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <CardHeader>
                    <CardTitle>Dados da Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="category-name" className="text-sm font-medium">Nome da Categoria</label>
                        <Input
                            id="category-name"
                            name="category-name"
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
                <CardFooter className="flex justify-between pt-4">
                    {onCancel ? (
                        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancel}>Cancelar</Button>
                    ) : (
                        <Link href="/admin/categories">
                            <Button type="button" variant="outline" disabled={isLoading}>Cancelar</Button>
                        </Link>
                    )}
                    <Button type="submit" disabled={isLoading || !name.trim()}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Salvar Alterações" : "Salvar Categoria"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
