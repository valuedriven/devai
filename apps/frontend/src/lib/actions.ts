"use server";

import { deleteProduct, deleteCategory, deleteCustomer, createCategory, updateCategory, transitionOrderStatus, registerPayment } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Category } from "./types";

export interface PaymentData {
    value: number;
    method: string;
    date: string;
    notes?: string;
    status?: string;
}

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
    try {
        await deleteCustomer(id, token);
        revalidatePath("/admin/customers");
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
}

export async function transitionOrderStatusAction(id: string, status: string, notes?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    const success = await transitionOrderStatus(id, status, notes, token);
    if (success) {
        revalidatePath(`/admin/orders/${id}`);
        revalidatePath(`/admin/orders`);
    }
    return success;
}

export async function registerPaymentAction(orderId: string, paymentData: PaymentData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("devai_auth_token")?.value;
    const success = await registerPayment(orderId, paymentData, token);
    if (success) {
        revalidatePath(`/admin/orders/${orderId}`);
    }
    return success;
}
