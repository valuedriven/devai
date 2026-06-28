import { Badge } from "@/components/ui/Badge";
import { getAdminOrders } from "@/lib/data";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { AdminActions } from "@/components/admin/AdminActions";
import { Order } from "@/lib/types";
import { OrderFilters } from "./OrderFilters";

import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ status?: string; startDate?: string; endDate?: string; search?: string }> 
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
 
    const filters = await searchParams;
    const orders = await getAdminOrders(token || '', filters);
    
    const statusToneMap: Record<string, "neutral" | "success" | "info" | "error" | "warning"> = {
        "New": "neutral",
        "Paid": "success",
        "Preparation": "info",
        "Invoiced": "info",
        "Shipped": "info",
        "Delivered": "success",
        "Cancelled": "error",
    };

    const columns: Column<Order>[] = [
        {
            header: "ID",
            cell: (order) => <span className="font-medium">#{order.number || order.id.slice(0, 8)}</span>,
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

            <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <AdminSearchBar placeholder="Pesquisar pedidos..." />
                
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <OrderFilters 
                        currentStatus={filters.status} 
                        currentStartDate={filters.startDate}
                        currentEndDate={filters.endDate}
                    />
                </div>
            </div>

            <AdminDataTable
                columns={columns}
                data={orders}
                keyField="id"
            />
        </div>
    );
}

