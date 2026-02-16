"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trash2, CheckCircle, LogIn } from "lucide-react";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export default function CartPage() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const { items: cartItems, updateQuantity, removeItem, clearCart, totalAmount: total } = useCart();
    const [isConfirming, setIsConfirming] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [orderId, setOrderId] = useState("");

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleConfirmOrder = async () => {
        setIsConfirming(true);
        // Simula processamento do pedido
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const newOrderId = `${1000 + Math.floor(Math.random() * 9000)}`;
        setOrderId(newOrderId);
        setOrderConfirmed(true);
        setIsConfirming(false);
        clearCart();
    };

    if (orderConfirmed) {
        return (
            <div className="container py-8">
                <div className="order-success-container">
                    <CheckCircle className="order-success-icon" />
                    <h1 className="order-success-title">Pedido Confirmado!</h1>
                    <p className="order-success-text">
                        Seu pedido <strong>#{orderId}</strong> foi realizado com sucesso.
                    </p>
                    <p className="order-success-subtext">
                        Você receberá uma confirmação por e-mail em breve.
                    </p>
                    <div className="order-success-actions">
                        <Button size="lg" onClick={() => router.push("/orders")}>
                            Ver Meus Pedidos
                        </Button>
                        <Link href="/" className="text-primary hover:underline text-sm">
                            Continuar comprando
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Cart Items List */}
                <div className="md:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item.id} className="flex flex-row items-center p-4 gap-4">
                            <div className="h-20 w-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{item.name}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {formatCurrency(item.price)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, 1)}
                                >
                                    +
                                </Button>
                            </div>
                            <div className="font-bold">
                                {formatCurrency(item.price * item.quantity)}
                            </div>
                            <div className="flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeItem(item.id)}
                                    aria-label={`Remover ${item.name}`}
                                >
                                    <Trash2 className="icon-sm" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {cartItems.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Seu carrinho está vazio.
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div>
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
                            {isSignedIn ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={cartItems.length === 0 || isConfirming}
                                    loading={isConfirming}
                                    onClick={handleConfirmOrder}
                                >
                                    {isConfirming ? 'Processando...' : 'Confirmar Pedido'}
                                </Button>
                            ) : (
                                <SignInButton mode="modal">
                                    <Button className="w-full" size="lg" disabled={cartItems.length === 0}>
                                        <LogIn className="icon-sm" style={{ marginRight: '0.5rem' }} />
                                        Faça login para confirmar
                                    </Button>
                                </SignInButton>
                            )}
                        </CardFooter>
                    </Card>

                    <div className="mt-4 text-center">
                        <Link href="/" className="text-primary hover:underline text-sm">Continuar comprando</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
