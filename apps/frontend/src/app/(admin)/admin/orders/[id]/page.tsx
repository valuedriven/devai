import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAdminOrder } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { OrderTimeline } from "./OrderTimeline";
import { OrderPayments } from "./OrderPayments";
import { StatusActions } from "./StatusActions";

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    
    const order = await getAdminOrder(id, token || '');

    if (!order) {
        return <div>Pedido não encontrado</div>;
    }

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
                <h1 className="text-3xl font-bold">Pedido #{order.number || order.id.slice(0, 8)}</h1>
                <Badge tone={statusToneMap[order.status] || "neutral"} className="ml-2 text-lg px-3 py-1">
                    {order.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Itens do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {order.items?.map((item, index) => (
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
                            <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <OrderPayments orderId={order.id} payments={order.payments || []} />
                    
                    <OrderTimeline logs={order.auditLogs || []} />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div><strong>Nome:</strong> {order.customer?.name}</div>
                            <div><strong>Email:</strong> {order.customer?.email}</div>
                            <div><strong>Telefone:</strong> {order.customer?.phone || 'Não informado'}</div>
                            <div className="pt-2"><strong>Endereço de Entrega:</strong></div>
                            <div className="text-sm text-muted-foreground">{order.shippingAddress || 'Não informado'}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ações do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatusActions orderId={order.id} currentStatus={order.status} token={token} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
