import { currentUser } from "@clerk/nextjs/server";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (user?.publicMetadata?.role !== "admin") {
        redirect("/");
    }



    return (
        <div className="flex-1 bg-slate-50 min-h-screen flex flex-col overflow-x-hidden">
            <AdminHeader />
            <div className="p-4 md:p-8 flex-1">
                {children}
            </div>
        </div>
    );
}
