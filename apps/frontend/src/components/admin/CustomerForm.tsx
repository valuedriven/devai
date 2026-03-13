"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Customer } from "@/lib/types";
import { createCustomer, updateCustomer } from "@/lib/data";
import { useAuth } from "@clerk/nextjs";

interface CustomerFormProps {
    initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        active: initialData ? initialData.active : true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();
            if (initialData) {
                await updateCustomer(initialData.id, formData, token ?? undefined);
            } else {
                await createCustomer(formData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>, token ?? undefined);
            }
            router.push("/admin/customers");
            router.refresh();
        } catch (error) {
            console.error("Error saving customer", error);
            alert("Erro ao salvar cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome Completo</label>
                        <Input
                            placeholder="Ex: João Silva"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">E-mail</label>
                            <Input
                                type="email"
                                placeholder="joao@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Telefone</label>
                            <Input
                                placeholder="(11) 99999-9999"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Endereço</label>
                        <Input
                            placeholder="Rua, Número, Bairro, Cidade - UF"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <label htmlFor="active" className="text-sm font-medium">Cliente Ativo</label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Link href="/admin/customers">
                        <Button variant="outline" type="button" disabled={loading}>Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Cliente"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
