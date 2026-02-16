import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrders } from "@/lib/data";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default async function AdminOrdersPage() {
    const orders = await getOrders();
    const statusToneMap: Record<string, "neutral" | "success" | "info" | "error" | "warning"> = {
        "Novo": "neutral",
        "Pago": "success",
        "Preparação": "info",
        "Faturado": "info",
        "Despachado": "info",
        "Entregue": "success",
        "Cancelado": "error",
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Pedidos</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Pesquisar pedidos..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Data</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Total</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">#{order.id}</td>
                                        <td className="p-4 align-middle">Cliente {order.customerId}</td>
                                        <td className="p-4 align-middle">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle">
                                            <Badge tone={statusToneMap[order.status] || "neutral"}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Link href={`/admin/orders/${order.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
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
