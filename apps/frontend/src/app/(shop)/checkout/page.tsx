"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useInternalAuth } from "@/hooks/AuthContext";
import { useCart } from "@/lib/CartContext";
import { createOrder, syncCustomerApi, getProduct } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
    const router = useRouter();
    const { isLoggedIn, authMe, isLoading: authLoading } = useAuthMe();
    const { token } = useInternalAuth();
    const { items: cartItems, clearCart, totalAmount: total } = useCart();
    
    const [shippingAddress, setShippingAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/login?redirect=/checkout");
        }
    }, [isLoggedIn, authLoading, router]);

    if (authLoading) {
        return <div className="container py-8 text-center">Carregando...</div>;
    }

    if (!isLoggedIn) {
        return null;
    }

    if (cartItems.length === 0) {
        return (
            <div className="container py-8 text-center space-y-4">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
                <p className="text-muted-foreground">Adicione produtos antes de prosseguir para o checkout.</p>
                <Link href="/">
                    <Button>Voltar para a loja</Button>
                </Link>
            </div>
        );
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            setError("O endereço de entrega é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const stockChecks = await Promise.all(
                cartItems.map(async (item) => {
                    const product = await getProduct(item.id);
                    return { item, product };
                })
            );

            const outOfStock = stockChecks.filter(({ product, item }) => {
                if (!product) return true;
                if (!product.active) return true;
                return product.stock < item.quantity;
            });

            if (outOfStock.length > 0) {
                const names = outOfStock.map(({ item }) => item.name).join(", ");
                setError(`Os seguintes produtos estão indisponíveis ou com estoque insuficiente: ${names}`);
                setIsSubmitting(false);
                return;
            }

            let customerId = undefined;
            if (authMe?.email) {
                const name = authMe.firstName ? `${authMe.firstName} ${authMe.lastName || ""}` : authMe.email;
                const customer = await syncCustomerApi({ email: authMe.email, name }, token ?? undefined);
                if (customer?.id) {
                    customerId = customer.id;
                }
            }

            const orderDto = {
                customerId,
                shippingAddress,
                order_items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: Number(item.quantity),
                })),
            };

            const order = await createOrder(orderDto, token ?? undefined);

            if (order && order.id) {
                clearCart();
                router.push(`/checkout/success?id=${order.id}`);
            } else {
                setError("Ocorreu um erro ao criar o pedido. Tente novamente.");
            }
        } catch (err: unknown) {
            console.error("Erro ao criar pedido", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage || "Erro ao processar seu pedido. Por favor, verifique o estoque.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/cart">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao Carrinho
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-bold">Finalizar Compra</h1>

            <form onSubmit={handleSubmitOrder} className="grid gap-8 md:grid-cols-3 md:items-start">
                <div className="md:col-span-2 space-y-6">
                    {/* Shipping Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Endereço de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium">Endereço Completo</label>
                                <Input
                                    id="address"
                                    placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-destructive text-sm" data-testid="checkout-error">{error}</p>}
                        </CardContent>
                    </Card>

                    {/* Payment Info Callout */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Pagamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                O pagamento será processado na próxima etapa. Pedidos criados ficam no estado &quot;Novo&quot; pendentes de pagamento.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary & Review */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revisão dos Itens</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.quantity}x {formatCurrency(item.price)}</p>
                                    </div>
                                    <span className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>Grátis</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isSubmitting}
                                loading={isSubmitting}
                            >
                                {isSubmitting ? "Finalizando..." : "Confirmar e Fechar Pedido"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}
