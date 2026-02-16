import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrders } from "@/lib/data";

export default async function OrdersPage() {
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
        <div className="container py-8 space-y-6">
            <h1 className="text-3xl font-bold">Meus Pedidos</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="font-bold text-lg">Pedido #{order.id}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Realizado em {new Date(order.date).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                                    <Badge tone={statusToneMap[order.status] || "neutral"}>
                                        {order.status}
                                    </Badge>

                                    <div className="font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                    </div>

                                    <Link href={`/orders/${order.id}`} className={buttonVariants({ variant: "outline" })}>
                                        Ver Detalhes
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
