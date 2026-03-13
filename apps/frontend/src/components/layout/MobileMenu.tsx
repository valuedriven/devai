import Link from "next/link";
import { X, LayoutDashboard, Package, Tags, Users, ShoppingBag, LogOut } from "lucide-react";


interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

export function MobileMenu({ isOpen, onClose, isAdmin }: MobileMenuProps) {


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
                        Início
                    </Link>
                    <Link href="/cart" className="mobile-menu-link" onClick={handleNavigate}>
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
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                Dashboard
                            </Link>
                            <Link href="/admin/products" className="mobile-menu-link" onClick={handleNavigate}>
                                <Package className="mr-3 h-5 w-5" />
                                Produtos
                            </Link>
                            <Link href="/admin/categories" className="mobile-menu-link" onClick={handleNavigate}>
                                <Tags className="mr-3 h-5 w-5" />
                                Categorias
                            </Link>
                            <Link href="/admin/customers" className="mobile-menu-link" onClick={handleNavigate}>
                                <Users className="mr-3 h-5 w-5" />
                                Clientes
                            </Link>
                            <Link href="/admin/orders" className="mobile-menu-link" onClick={handleNavigate}>
                                <ShoppingBag className="mr-3 h-5 w-5" />
                                Pedidos
                            </Link>

                            <div className="my-2 border-t border-slate-200"></div>

                            <Link href="/" className="mobile-menu-link text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleNavigate}>
                                <LogOut className="mr-3 h-5 w-5" />
                                Sair da Loja
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}
