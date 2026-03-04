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
    useUser,
} from "@clerk/nextjs";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { itemCount } = useCart();
    const { user } = useUser();

    const isAdmin = user?.publicMetadata?.role === "admin";

    return (
        <header className="header-root">
            <div className="header-container">
                {/* Logo */}
                <div className="header-brand">
                    {/* Mobile Menu Trigger */}
                    {/* Menu Trigger - Visible on mobile ALWAYS, and on desktop for ADMINS as a 'Lateral Menu' */}
                    <button
                        className={`${!isAdmin ? "hidden-desktop" : ""} menu-trigger-btn`}
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="icon-md" />
                        <span className="sr-only">Menu</span>
                    </button>
                    <Link href="/" className="header-logo ml-2">
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
                        <SignInButton mode="modal" fallbackRedirectUrl="/">
                            <button className="btn-icon-size btn-ghost rounded-md">
                                <User className="icon-md" />
                                <span className="sr-only">Login</span>
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        {isAdmin && (
                            <Link href="/admin" className="text-sm font-medium mr-4 hover:text-primary transition-colors">
                                Admin
                            </Link>
                        )}
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all shadow-sm",
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>

            {/* Mobile Menu Component */}
            <MobileMenu isAdmin={isAdmin} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
}
