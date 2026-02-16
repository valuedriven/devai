"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useCart } from "@/lib/CartContext";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/nextjs";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { itemCount } = useCart();

    return (
        <header className="header-root">
            <div className="header-container">
                {/* Logo */}
                <div className="header-brand">
                    {/* Mobile Menu Trigger */}
                    <button
                        className="hidden-desktop btn-icon-size btn-ghost rounded-md"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="icon-md" />
                        <span className="sr-only">Menu</span>
                    </button>
                    <Link href="/" className="header-logo">
                        DEVIA
                    </Link>
                </div>

                {/* Search Bar - Desktop */}
                <div className="header-search">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <Input
                            type="search"
                            placeholder="Buscar produtos..."
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="header-actions">
                    <Link href="/cart" className="btn-icon-size btn-ghost rounded-md cart-icon-wrapper">
                        <ShoppingCart className="icon-md" />
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        <span className="sr-only">Carrinho</span>
                    </Link>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="btn-icon-size btn-ghost rounded-md">
                                <User className="icon-md" />
                                <span className="sr-only">Login</span>
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>

            {/* Mobile Menu Component */}
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
}
