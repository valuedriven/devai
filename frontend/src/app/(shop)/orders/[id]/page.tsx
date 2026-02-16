import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrder, getProducts } from "@/lib/data";
import { ArrowLeft } from "lucide-react";

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await getOrder(id);
    const allProducts = await getProducts();

    if (!order) {
        return <div className="container py-8">Pedido não encontrado</div>;
    }

    const orderProducts = (order.items || []).map(item => {
        const product = allProducts.find(p => String(p.id) === String(item.product_id));
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
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/orders">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar aos Pedidos
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
                    <p className="text-muted-foreground">Realizado em {new Date(order.date).toLocaleString()}</p>
                </div>
                <Badge tone={statusToneMap[order.status] || "neutral"} className="text-lg px-4 py-1">
                    {order.status}
                </Badge>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Itens do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orderProducts.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                        <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {item.product && <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{item.product?.name || `Produto ${item.productId}`}</h4>
                                            <p className="text-sm text-muted-foreground">{item.quantity} unidade(s)</p>
                                        </div>
                                        <div className="font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>Grátis</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
