"use server";

import { deleteProduct, deleteCategory, deleteCustomer } from "@/lib/data";
import { revalidatePath } from "next/cache";
export async function deleteProductAction(id: string, token?: string) {
    const success = await deleteProduct(id, token);
    if (success) {
        revalidatePath("/admin/products");
    }
    return success;
}

export async function deleteCategoryAction(id: string, token?: string) {
    const success = await deleteCategory(id, token);
    if (success) {
        revalidatePath("/admin/categories");
    }
    return success;
}

export async function deleteCustomerAction(id: string, token?: string) {
    const success = await deleteCustomer(id, token);
    if (success) {
        revalidatePath("/admin/customers");
    }
    return success;
}
