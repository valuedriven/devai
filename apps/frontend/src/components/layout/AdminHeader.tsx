"use client";
import { useAuthMe } from "@/hooks/useAuthMe";

export function AdminHeader() {
    const { authMe } = useAuthMe();
    const userName = authMe?.firstName ? `${authMe.firstName} ${authMe.lastName || ""}` : (authMe?.email || "Admin");

    return (
        <header className="h-16 bg-white border-b flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold text-lg">Painel Administrativo</h1>
            </div>
            <div className="text-sm text-muted-foreground mr-4">{userName}</div>
        </header>
    );
}
