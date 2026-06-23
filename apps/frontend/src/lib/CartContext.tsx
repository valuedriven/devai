"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    itemCount: number;
    totalAmount: number;
    isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'devai_cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Failed to parse cart from localStorage:', e);
                }
            }
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addItem = (newItem: CartItem) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === newItem.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prevItems, newItem];
        });
    };

    const removeItem = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                itemCount,
                totalAmount,
                isInitialized,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
