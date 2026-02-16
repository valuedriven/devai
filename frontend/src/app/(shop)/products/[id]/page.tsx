import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { getProduct } from "@/lib/data";
import { ArrowLeft, ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/Button";

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container py-8 space-y-8">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a loja
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden rounded-lg bg-muted/20 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            <Badge tone={product.stock > 0 ? "success" : "error"}>
                                {product.stock > 0 ? "Em Estoque" : "Esgotado"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Cód: {product.id}
                            </span>
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </div>

                    <div className="prose prose-sm text-muted-foreground">
                        <p>{product.description}</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                        <div className="flex items-center gap-4">
                            <AddToCartButton product={product} />
                        </div>

                        {/* Shipping Simulator Mock */}
                        <div className="flex gap-2 max-w-sm">
                            <div className="relative flex-1">
                                <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Calcular frete (CEP)"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <Button variant="outline">OK</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
