"use server";

import { deleteProduct, deleteCategory, deleteCustomer, createCategory, updateCategory } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { Category } from "./types";
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

export async function createCategoryAction(category: Omit<Category, 'id'>, token?: string) {
    const result = await createCategory(category, token);
    if (result) {
        revalidatePath("/admin/categories");
    }
    return result;
}

export async function updateCategoryAction(id: string, category: Partial<Omit<Category, 'id'>>, token?: string) {
    const result = await updateCategory(id, category, token);
    if (result) {
        revalidatePath("/admin/categories");
    }
    return result;
}

export async function deleteCustomerAction(id: string, token?: string) {
    const success = await deleteCustomer(id, token);
    if (success) {
        revalidatePath("/admin/customers");
    }
    return success;
}
