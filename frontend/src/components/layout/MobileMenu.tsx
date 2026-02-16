import Link from "next/link";
import { X } from "lucide-react";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
                    <Link href="/" className="mobile-menu-link" onClick={onClose}>
                        Início
                    </Link>
                    <Link href="/products" className="mobile-menu-link" onClick={onClose}>
                        Produtos
                    </Link>
                    <Link href="/cart" className="mobile-menu-link" onClick={onClose}>
                        Carrinho
                    </Link>
                    <Link href="/login" className="mobile-menu-link" onClick={onClose}>
                        Minha Conta
                    </Link>
                </nav>
            </div>
        </>
    );
}
