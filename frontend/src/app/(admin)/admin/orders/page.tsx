import { Badge } from "@/components/ui/Badge";
import { getOrders } from "@/lib/data";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Order } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
    const search = (await searchParams).search ?? '';
    const orders = await getOrders(undefined, search);
    const statusToneMap: Record<string, "neutral" | "success" | "info" | "error" | "warning"> = {
        "Novo": "neutral",
        "Pago": "success",
        "Preparação": "info",
        "Faturado": "info",
        "Despachado": "info",
        "Entregue": "success",
        "Cancelado": "error",
    };

    const columns: Column<Order>[] = [
        {
            header: "ID",
            cell: (order) => <span className="font-medium">#{order.id}</span>,
        },
        {
            header: "Cliente",
            cell: (order) => order.customer?.name || `Cliente ${order.customerId}`,
        },
        {
            header: "Data",
            cell: (order) => new Date(order.date).toLocaleDateString(),
        },
        {
            header: "Status",
            cell: (order) => (
                <Badge tone={statusToneMap[order.status] || "neutral"}>
                    {order.status}
                </Badge>
            ),
        },
        {
            header: "Total",
            align: "right",
            cell: (order) => (
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)
            ),
        },
        {
            header: "Ações",
            align: "right",
            cell: (order) => (
                <AdminActions
                    id={order.id}
                    viewHref={`/admin/orders/${order.id}`}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Pedidos</h1>
            </div>

            <AdminSearchBar placeholder="Pesquisar pedidos..." />

            <AdminDataTable
                columns={columns}
                data={orders}
                keyField="id"
            />
        </div>
    );
}

