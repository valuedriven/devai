import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrder, getProducts, updateOrderStatus } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { getToken } = await auth();
    const token = await getToken();
    const order = await getOrder(id, token ?? undefined);
    const allProducts = await getProducts(); // Usually public

    if (!order) {
        return <div>Pedido não encontrado</div>;
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

    async function handleUpdateStatus(formData: FormData) {
        "use server";
        if (!order) return;
        const { getToken: getActionToken } = await auth();
        const actionToken = await getActionToken();
        const newStatus = formData.get("status") as string;
        if (newStatus && newStatus !== order.status) {
            await updateOrderStatus(id, newStatus, actionToken ?? undefined);
            revalidatePath(`/admin/orders/${id}`);
            revalidatePath(`/admin/orders`);
        }
    }

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
                    <CardFooter className="flex flex-wrap gap-4">
                        <form action={handleUpdateStatus}>
                            <input type="hidden" name="status" value="Cancelado" />
                            <Button type="submit" variant="outline" disabled={order.status === "Cancelado"}>
                                Cancelar Pedido
                            </Button>
                        </form>
                        <form action={handleUpdateStatus} className="flex gap-2 ml-auto">
                            <select name="status" className="border rounded-md px-3 text-sm bg-background" defaultValue={order.status}>
                                <option value="Novo">Novo</option>
                                <option value="Pago">Pago</option>
                                <option value="Preparação">Preparação</option>
                                <option value="Faturado">Faturado</option>
                                <option value="Despachado">Despachado</option>
                                <option value="Entregue">Entregue</option>
                            </select>
                            <Button type="submit">Atualizar Status</Button>
                        </form>
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
