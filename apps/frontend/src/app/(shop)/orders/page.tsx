"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useInternalAuth } from "@/hooks/AuthContext";
import { getOrders } from "@/lib/data";
import { Order } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function OrdersPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuthMe();
    const { token } = useInternalAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [statusFilter, setStatusFilter] = useState("Todos");

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/login?redirect=/orders");
        }
    }, [isLoggedIn, authLoading, router]);

    useEffect(() => {
        async function fetchOrders() {
            if (token) {
                setIsLoadingOrders(true);
                try {
                    const status = statusFilter === "Todos" ? undefined : statusFilter;
                    const result = await getOrders(undefined, undefined, token, page, PAGE_SIZE, status);
                    setOrders(result.data);
                    setTotal(result.total);
                } catch (error) {
                    console.error("Failed to load orders", error);
                } finally {
                    setIsLoadingOrders(false);
                }
            }
        }
        if (isLoggedIn && token) {
            fetchOrders();
        }
    }, [isLoggedIn, token, page, statusFilter]);

    if (authLoading || (isLoggedIn && isLoadingOrders)) {
        return <div className="container py-8 text-center">Carregando...</div>;
    }

    if (!isLoggedIn) {
        return null;
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

    const filterOptions = ["Todos", "Novo", "Pago", "Faturado", "Despachado", "Entregue", "Cancelado"];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="container py-8 space-y-6">
            <h1 className="text-3xl font-bold">Meus Pedidos</h1>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 pb-2 border-b">
                {filterOptions.map((status) => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        data-testid={`filter-${status.toLowerCase()}`}
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Nenhum pedido encontrado.
                    </div>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="font-bold text-lg">Pedido #{order.id}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Realizado em {new Date(order.date || "").toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <Badge tone={statusToneMap[order.status] || "neutral"}>
                                            {order.status}
                                        </Badge>

                                        <div className="font-bold">
                                            {formatCurrency(order.total)}
                                        </div>

                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">
                                                Ver Detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                        Página {page} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
