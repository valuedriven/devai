import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCustomers } from "@/lib/data";
import { deleteCustomerAction } from "@/lib/actions";
import { Plus, Mail, Phone } from "lucide-react";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Customer } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
    const search = (await searchParams).search ?? '';
    const customers = await getCustomers(search);

    const columns: Column<Customer>[] = [
        {
            header: "Nome",
            accessor: "name",
            className: "font-medium",
        },
        {
            header: "Contato",
            cell: (customer) => (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {customer.email}
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: "Endereço",
            className: "max-w-[200px] truncate",
            cell: (customer) => (
                <span title={customer.address}>{customer.address}</span>
            ),
        },
        {
            header: "Status",
            cell: (customer) => (
                <Badge tone={customer.active ? "success" : "neutral"}>
                    {customer.active ? "Ativo" : "Inativo"}
                </Badge>
            ),
        },
        {
            header: "Ações",
            align: "right",
            cell: (customer) => (
                <AdminActions
                    id={customer.id}
                    editHref={`/admin/customers/${customer.id}/edit`}
                    deleteAction={deleteCustomerAction}
                    deleteConfirmMessage={`Tem certeza que deseja excluir o cliente "${customer.name}"?`}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <Link href="/admin/customers/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Link>
            </div>

            <AdminSearchBar placeholder="Pesquisar clientes..." />

            <AdminDataTable
                columns={columns}
                data={customers}
                keyField="id"
            />
        </div>
    );
}

