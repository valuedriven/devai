"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Customer } from "@/lib/types";
import { createCustomer, updateCustomer } from "@/lib/data";
import { useInternalAuth } from "@/hooks/AuthContext";
import { useToast } from "@/components/ui/toast-context";

interface CustomerFormProps {
    initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
    const router = useRouter();
    const { token } = useInternalAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        active: initialData ? initialData.active : true,
    });

    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                const res = await updateCustomer(initialData.id, formData, token ?? undefined);
                if (!res) throw new Error("Erro ao atualizar cliente.");
                addToast("Cliente atualizado com sucesso!", "success");
            } else {
                const res = await createCustomer(formData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>, token ?? undefined);
                if (!res) throw new Error("Erro ao cadastrar cliente.");
                addToast("Cliente cadastrado com sucesso!", "success");
            }
            router.push("/admin/customers");
            router.refresh();
        } catch (error) {
            console.error("Error saving customer", error);
            addToast("Erro ao salvar cliente.", "error");
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
                        <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                        <Input
                            id="name"
                            placeholder="Ex: João Silva"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="joao@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
                            <Input
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">Endereço</label>
                        <Input
                            id="address"
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
