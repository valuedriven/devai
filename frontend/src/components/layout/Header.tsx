"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    <Link href="/cart" className="btn-icon-size btn-ghost rounded-md">
                        <ShoppingCart className="icon-md" />
                        <span className="sr-only">Carrinho</span>
                    </Link>
                    <Link href="/login" className="btn-icon-size btn-ghost rounded-md">
                        <User className="icon-md" />
                        <span className="sr-only">Perfil</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Component */}
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
}
