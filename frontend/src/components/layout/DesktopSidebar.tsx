"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Users, ShoppingBag, LogOut, Home, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUser, SignOutButton } from "@clerk/nextjs";

export function DesktopSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const isAdmin = user?.publicMetadata?.role === "admin";
    const isLoggedIn = !!user;

    return (
        <aside className="sidebar-desktop">
            <div className="sidebar-header">
                <Link href="/">DevAI</Link>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-divider">
                    <span className="sidebar-section-label">
                        Loja
                    </span>
                </div>
                <Link href="/">
                    <Button variant="ghost" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}>
                        <Home className="mr-3 h-5 w-5" />
                        Início
                    </Button>
                </Link>
                {isLoggedIn && (
                    <Link href="/orders">
                        <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/orders') ? 'active' : ''}`}>
                            <Search className="mr-3 h-5 w-5" />
                            Meus pedidos
                        </Button>
                    </Link>
                )}
                <Link href="/cart">
                    <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/cart') ? 'active' : ''}`}>
                        <ShoppingCart className="mr-3 h-5 w-5" />
                        Carrinho
                    </Button>
                </Link>

                {isAdmin && (
                    <>
                        <div className="sidebar-section-divider mt-6">
                            <div className="pb-2">
                                <span className="sidebar-section-label">
                                    Administração
                                </span>
                            </div>
                        </div>
                        <Link href="/admin">
                            <Button variant="ghost" className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}>
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/admin/products">
                            <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/admin/products') ? 'active' : ''}`}>
                                <Package className="mr-3 h-5 w-5" />
                                Produtos
                            </Button>
                        </Link>
                        <Link href="/admin/categories">
                            <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/admin/categories') ? 'active' : ''}`}>
                                <Tags className="mr-3 h-5 w-5" />
                                Categorias
                            </Button>
                        </Link>
                        <Link href="/admin/customers">
                            <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/admin/customers') ? 'active' : ''}`}>
                                <Users className="mr-3 h-5 w-5" />
                                Clientes
                            </Button>
                        </Link>
                        <Link href="/admin/orders">
                            <Button variant="ghost" className={`sidebar-link ${pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
                                <ShoppingBag className="mr-3 h-5 w-5" />
                                Pedidos
                            </Button>
                        </Link>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <SignOutButton>
                    <Button variant="ghost" className="sidebar-logout-btn">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sair da Loja
                    </Button>
                </SignOutButton>
            </div>
        </aside>
    );
}
