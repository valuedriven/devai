import { currentUser } from "@clerk/nextjs/server";

export async function AdminHeader() {
    const user = await currentUser();
    const userName = user?.fullName || user?.firstName || "Admin";

    return (
        <header className="h-16 bg-white border-b flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold text-lg">Painel Administrativo</h1>
            </div>
            <div className="text-sm text-muted-foreground mr-4">{userName}</div>
        </header>
    );
}
