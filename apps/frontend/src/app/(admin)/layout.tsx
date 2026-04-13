import { cookies } from "next/headers";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    
    if (!token) {
        redirect("/login");
    }

    const userProfile = await getMe(token);

    if (!userProfile?.roles?.includes("admin")) {
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
