"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useInternalAuth } from "@/hooks/AuthContext";
import { getOrder, cancelOrder, getProducts } from "@/lib/data";
import { Order, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Ban } from "lucide-react";
import Image from "next/image";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuthMe();
    const { token } = useInternalAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");

    // Destructure params properly
    const [orderId, setOrderId] = useState<string>("");
    useEffect(() => {
        if (params) {
            Promise.resolve(params).then((resolvedParams) => {
                setOrderId(resolvedParams.id);
            });
        }
    }, [params]);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/login?redirect=/orders");
        }
    }, [isLoggedIn, authLoading, router]);

    useEffect(() => {
        async function loadData() {
            if (token && orderId) {
                setIsLoadingData(true);
                try {
                    const [orderData, productsData] = await Promise.all([
                        getOrder(orderId, token),
                        getProducts()
                    ]);
                    setOrder(orderData);
                    setAllProducts(productsData);
                } catch (error) {
                    console.error("Failed to load order details", error);
                } finally {
                    setIsLoadingData(false);
                }
            }
        }
        if (isLoggedIn && token && orderId) {
            loadData();
        }
    }, [isLoggedIn, token, orderId]);

    if (authLoading || (isLoggedIn && isLoadingData) || !orderId) {
        return <div className="container py-8 text-center">Carregando...</div>;
    }

    if (!isLoggedIn) {
        return null;
    }

    if (!order) {
        return <div className="container py-8 text-center text-muted-foreground">Pedido não encontrado</div>;
    }

    const orderProducts = (order.items || []).map(item => {
        const product = item.product || allProducts.find(p => String(p.id) === String(item.productId));
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

    const handleCancelOrder = async () => {
        if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
            return;
        }

        setIsCancelling(true);
        setCancelError("");

        try {
            const success = await cancelOrder(order.id, token ?? undefined);
            if (success) {
                // Refresh order details from server
                const updatedOrder = await getOrder(order.id, token ?? undefined);
                setOrder(updatedOrder);
            } else {
                setCancelError("Erro ao tentar cancelar o pedido.");
            }
        } catch (error: unknown) {
            console.error("Erro ao cancelar pedido", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setCancelError(errorMessage || "Erro ao processar o cancelamento.");
        } finally {
            setIsCancelling(false);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/orders">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar aos Pedidos
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
                    <p className="text-muted-foreground">Realizado em {new Date(order.date || "").toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge tone={statusToneMap[order.status] || "neutral"} className="text-lg px-4 py-1">
                        {order.status}
                    </Badge>

                    {order.status === "Novo" && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            loading={isCancelling}
                            data-testid="cancel-order-button"
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            Cancelar Pedido
                        </Button>
                    )}
                </div>
            </div>

            {cancelError && (
                <p className="text-destructive text-sm" data-testid="cancel-error">
                    {cancelError}
                </p>
            )}

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
                                        <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                            {item.product?.image && (
                                                <Image
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                    unoptimized={item.product.image?.startsWith('http')}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{item.product?.name || `Produto ${item.productId}`}</h4>
                                            <p className="text-sm text-muted-foreground">{item.quantity} unidade(s)</p>
                                        </div>
                                        <div className="font-bold">
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {order.shippingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Endereço de Entrega</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{order.shippingAddress}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>Grátis</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
