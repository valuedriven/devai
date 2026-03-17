import { X, LayoutDashboard, Package, Tags, Users, ShoppingBag, LogOut, Home, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useInternalAuth } from "@/hooks/AuthContext";


interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

export function MobileMenu({ isOpen, onClose, isAdmin }: MobileMenuProps) {
    const { isAuthenticated, logout } = useInternalAuth();
    const isLoggedIn = isAuthenticated;


    const handleNavigate = () => {
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`mobile-menu-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />

            {/* Menu Content */}
            <div className={`mobile-menu-content ${isOpen ? "open" : ""}`}>
                <div className="mobile-menu-header">
                    <span className="mobile-menu-title">Menu</span>
                    <button onClick={onClose} className="btn-icon-size btn-ghost rounded-md">
                        <X className="icon-md" />
                    </button>
                </div>

                <nav className="mobile-menu-nav">
                    <div className="pb-2 border-b mb-2">
                        <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Loja
                        </span>
                    </div>
                    <Link href="/" className="mobile-menu-link" onClick={handleNavigate}>
                        <Home className="icon-md mr-3" />
                        Início
                    </Link>
                    <Link href="/cart" className="mobile-menu-link" onClick={handleNavigate}>
                        <ShoppingCart className="icon-md mr-3" />
                        Carrinho
                    </Link>

                    {isAdmin && (
                        <div className="mt-6 pt-4 border-t">
                            <div className="pb-2">
                                <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Administração
                                </span>
                            </div>
                            <Link href="/admin" className="mobile-menu-link" onClick={handleNavigate}>
                                <LayoutDashboard className="icon-md mr-3" />
                                Dashboard
                            </Link>
                            <Link href="/admin/products" className="mobile-menu-link" onClick={handleNavigate}>
                                <Package className="icon-md mr-3" />
                                Produtos
                            </Link>
                            <Link href="/admin/categories" className="mobile-menu-link" onClick={handleNavigate}>
                                <Tags className="icon-md mr-3" />
                                Categorias
                            </Link>
                            <Link href="/admin/customers" className="mobile-menu-link" onClick={handleNavigate}>
                                <Users className="icon-md mr-3" />
                                Clientes
                            </Link>
                            <Link href="/admin/orders" className="mobile-menu-link" onClick={handleNavigate}>
                                <ShoppingBag className="icon-md mr-3" />
                                Pedidos
                            </Link>
                        </div>
                    )}

                    {isLoggedIn && (
                        <div className="my-2 border-t mt-4 pt-4">
                            <button 
                                className="mobile-menu-link text-red-500 w-full text-left bg-transparent border-none cursor-pointer" 
                                onClick={() => {
                                    logout();
                                    handleNavigate();
                                }}
                            >
                                <LogOut className="icon-md mr-3" />
                                Sair da Loja
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}
