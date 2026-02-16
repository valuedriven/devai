import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getOrders } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { DollarSign, ShoppingBag, Clock } from "lucide-react";

export default async function AdminDashboard() {
    const orders = await getOrders();
    const totalSales = orders
        .filter(o => o.status !== 'Cancelado')
        .reduce((acc, curr) => acc + curr.total, 0);

    const totalPending = orders
        .filter(o => o.status === 'Novo' || o.status === 'Preparação')
        .reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="space-y-8">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Totais</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Últimos Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Data</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {orders.slice(0, 5).map((order) => {
                                    // Map status to tone (simple mapping for now, ideally strictly typed)
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
                                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{order.id}</td>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
