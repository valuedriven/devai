"use client";

import Link from "next/link";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trash2, LogIn } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
    const { isLoggedIn } = useAuthMe();
    const { items: cartItems, updateQuantity, removeItem, totalAmount: total } = useCart();

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

            <div className="grid gap-8 md:grid-cols-3 md:items-start">
                {/* Cart Items List */}
                <div className="md:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                                <div className="h-20 w-20 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                        unoptimized={item.image?.startsWith('http')}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate text-base sm:text-lg">{item.name}</h3>
                                    <p className="text-muted-foreground text-sm truncate">
                                        {formatCurrency(item.price)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0 border-t sm:border-0 pt-4 sm:pt-0">
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
                                    <span className="w-8 text-center" data-testid="cart-item-quantity">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="font-bold min-w-[100px] text-right">
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                                <div className="flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-8 w-8"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remover ${item.name}`}
                                    >
                                        <Trash2 className="icon-sm" />
                                    </Button>
                                </div>
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
                            {isLoggedIn ? (
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full" size="lg" disabled={cartItems.length === 0}>
                                        Ir para o Checkout
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login?redirect=/cart" className="w-full">
                                    <Button className="w-full" size="lg" disabled={cartItems.length === 0}>
                                        <LogIn className="icon-sm" style={{ marginRight: '0.5rem' }} />
                                        Faça login para comprar
                                    </Button>
                                </Link>
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
