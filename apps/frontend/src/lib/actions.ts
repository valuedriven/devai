"use server";

import { deleteProduct, deleteCategory, deleteCustomer } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteProductAction(id: string) {
    const { getToken } = await auth();
    const token = await getToken();
    const success = await deleteProduct(id, token ?? undefined);
    if (success) {
        revalidatePath("/admin/products");
    }
    return success;
}

export async function deleteCategoryAction(id: string) {
    const { getToken } = await auth();
    const token = await getToken();
    const success = await deleteCategory(id, token ?? undefined);
    if (success) {
        revalidatePath("/admin/categories");
    }
    return success;
}

export async function deleteCustomerAction(id: string) {
    const { getToken } = await auth();
    const token = await getToken();
    const success = await deleteCustomer(id, token ?? undefined);
    if (success) {
        revalidatePath("/admin/customers");
    }
    return success;
}
