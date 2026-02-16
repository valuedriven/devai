import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { orders, products } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const order = orders.find((o) => o.id === params.id);

    if (!order) {
        return <div>Pedido não encontrado</div>;
    }

    const orderProducts = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return { ...item, product };
    });

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
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
                <Badge tone={statusToneMap[order.status] || "neutral"} className="ml-2 text-lg px-3 py-1">
                    {order.status}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div><strong>Data:</strong> {new Date(order.date).toLocaleString()}</div>
                        <div><strong>Cliente ID:</strong> {order.customerId}</div>
                        <div><strong>Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex gap-2">
                            <Button variant="outline">Cancelar Pedido</Button>
                            <Button>Atualizar Status</Button>
                        </div>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Itens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {orderProducts.map((item, index) => (
                                <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <div className="font-medium">{item.product?.name || `Produto ${item.productId}`}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
