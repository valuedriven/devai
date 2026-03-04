import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, Package, Users, ShoppingBag, LogOut, Tags } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (user?.publicMetadata?.role !== "admin") {
        redirect("/");
    }

    const userName = user?.firstName || "Admin";

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - Always visible fixed side menu */}
            <aside className="w-64 bg-slate-900 text-slate-50 flex-col fixed inset-y-0 left-0 z-20 flex">
                <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
                    DEVIA Admin
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Package className="mr-2 h-4 w-4" />
                            Produtos
                        </Button>
                    </Link>
                    <Link href="/admin/categories">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Tags className="mr-2 h-4 w-4" />
                            Categorias
                        </Button>
                    </Link>
                    <Link href="/admin/customers">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" />
                            Clientes
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Pedidos
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair da Loja
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content - Always margined */}
            <main className="flex-1 ml-64 bg-slate-50 min-h-screen flex flex-col overflow-x-hidden">
                <AdminHeader />
                <div className="p-4 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
