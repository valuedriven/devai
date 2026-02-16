"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Product } from "@/lib/types";
import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { useCart } from "@/lib/CartContext";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleAdd = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    };

    return (
        <div className="product-card group">
            <div className="product-image-wrapper">
                <Link href={`/products/${product.id}`} className="product-image-link">
                    {!imageError ? (
                        <>
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className={`product-image ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setImageLoading(false)}
                                onError={() => {
                                    setImageLoading(false);
                                    setImageError(true);
                                }}
                            />
                        </>
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-500 p-4 text-center">
                            <ImageOff className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-xs font-medium">Imagem indisponível</span>
                        </div>
                    )}
                </Link>
                {!product.active && (
                    <div className="product-badge">
                        <Badge tone="error">Indisponível</Badge>
                    </div>
                )}
            </div>

            <div className="product-content">
                <div>
                    <Link href={`/products/${product.id}`} className="product-title">
                        {product.name}
                    </Link>
                    <p className="product-description">{product.description}</p>
                </div>

                <div className="product-footer">
                    <div className="product-price-row">
                        <div className="product-price">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </div>
                        <div className="product-stock">
                            {product.stock > 0 ? `${product.stock} un.` : 'Sem estoque'}
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        disabled={!product.active || product.stock === 0}
                        variant={product.stock === 0 ? "secondary" : "primary"}
                        onClick={handleAdd}
                    >
                        {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
