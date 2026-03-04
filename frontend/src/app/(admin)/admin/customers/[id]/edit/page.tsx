import { CustomerForm } from "@/components/admin/CustomerForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getCustomer } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await getCustomer(id);

    if (!customer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/customers" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-3xl font-bold">Editar Cliente</h1>
            </div>

            <CustomerForm initialData={customer} />
        </div>
    );
}
