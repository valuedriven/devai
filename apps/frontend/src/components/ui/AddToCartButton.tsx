"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "./Button";
import { useCart } from "@/lib/CartContext";
import { Product } from "@/lib/types";

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart();

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
        <Button
            size="lg"
            className="w-full md:w-auto"
            disabled={product.stock === 0}
            onClick={handleAdd}
        >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adicionar ao Carrinho
        </Button>
    );
}
