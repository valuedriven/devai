import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCustomers } from "@/lib/data";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CustomerActions } from "@/components/admin/CustomerActions";

export default async function AdminCustomersPage() {
    const customers = await getCustomers();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <Link href="/admin/customers/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Pesquisar clientes..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nome</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Contato</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Endereço</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{customer.name}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {customer.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle max-w-[200px] truncate" title={customer.address}>
                                            {customer.address}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge tone={customer.active ? "success" : "neutral"}>
                                                {customer.active ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <CustomerActions id={customer.id} />
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
