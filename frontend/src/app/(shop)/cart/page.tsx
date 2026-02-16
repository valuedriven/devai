import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input"; // For quantity if needed

export default function CartPage() {
    // Mock cart items
    const cartItems = [
        { id: 1, name: "Smartphone X", price: 2999.00, quantity: 1, image: "https://placehold.co/100x100/136dec/ffffff?text=Phone" },
        { id: 2, name: "Camiseta Devia", price: 89.90, quantity: 2, image: "https://placehold.co/100x100/136dec/ffffff?text=Shirt" },
    ];

    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8">-</Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8">+</Button>
                            </div>
                            <div className="font-bold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
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
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>Grátis</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg">Confirmar Pedido</Button>
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
