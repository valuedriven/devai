import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function OrdersLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id?: string }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    const { id } = await params;
    const currentPath = id ? `/orders/${id}` : '/orders';

    if (!token) {
        redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }

    const userProfile = await getMe(token);

    if (!userProfile) {
        redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }

    return <>{children}</>;
}
