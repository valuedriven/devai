/* eslint-disable @typescript-eslint/no-explicit-any */

import { Category, Product, Customer, Order } from './types';
import { fetchApi } from './api';

export async function getCategories(search?: string): Promise<Category[]> {
    try {
        const categories = await fetchApi<any[]>('/categories');
        const mapped = categories.map(cat => ({
            ...cat,
            id: String(cat.id),
            active: true
        })) as Category[];
        if (search) {
            const lower = search.toLowerCase();
            return mapped.filter(c => c.name.toLowerCase().includes(lower));
        }
        return mapped;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getCategory(id: string): Promise<Category | null> {
    try {
        const data = await fetchApi<any>(`/categories/${id}`);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id),
            active: true
        } as Category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

export async function createCategory(category: Omit<Category, 'id'>, token?: string): Promise<Category | null> {
    try {
        const data = await fetchApi<any>('/categories', {
            method: 'POST',
            body: JSON.stringify({ name: category.name })
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Category;
    } catch (error) {
        console.error('Error creating category:', error);
        return null;
    }
}

export async function updateCategory(id: string, category: Partial<Omit<Category, 'id'>>, token?: string): Promise<Category | null> {
    try {
        const dto: any = {};
        if (category.name) dto.name = category.name;

        const data = await fetchApi<any>(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Category;
    } catch (error) {
        console.error('Error updating category:', error);
        return null;
    }
}

export async function deleteCategory(id: string, token?: string): Promise<boolean> {
    try {
        await fetchApi(`/categories/${id}`, {
            method: 'DELETE'
        }, token);
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
}

export async function getProducts(search?: string): Promise<Product[]> {
    try {
        const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
        const products = await fetchApi<any[]>(url);
        return products.map(p => ({
            ...p,
            id: String(p.id),
            image: p.imageUrl || p.image || '/placeholder.png',
            categoryId: String(p.categoryId),
            image_url: p.imageUrl || p.image || '/placeholder.png',
            category_id: String(p.categoryId),
            active: p.active !== undefined ? p.active : true
        })) as Product[];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const data = await fetchApi<any>(`/products/${id}`);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id),
            image: data.imageUrl || data.image || '/placeholder.png',
            categoryId: String(data.categoryId),
            image_url: data.imageUrl || data.image || '/placeholder.png',
            category_id: String(data.categoryId),
            active: data.active !== undefined ? data.active : true
        } as Product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function createProduct(product: Omit<Product, 'id'>, token?: string): Promise<Product | null> {
    try {
        const dto = {
            name: product.name,
            description: product.description,
            price: Number(product.price),
            imageUrl: product.image_url || product.image,
            categoryId: String(product.category_id || product.categoryId),
            stock: Number(product.stock),
            active: !!product.active
        };

        const data = await fetchApi<any>('/products', {
            method: 'POST',
            body: JSON.stringify(dto)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Product;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id'>>, token?: string): Promise<Product | null> {
    try {
        const dto: any = {};
        if (product.name) dto.name = product.name;
        if (product.description) dto.description = product.description;
        if (product.price !== undefined) dto.price = Number(product.price);
        if (product.image_url || product.image) dto.imageUrl = product.image_url || product.image;
        if (product.category_id || product.categoryId) dto.categoryId = String(product.category_id || product.categoryId);
        if (product.stock !== undefined) dto.stock = Number(product.stock);
        if (product.active !== undefined) dto.active = !!product.active;

        const data = await fetchApi<any>(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Product;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
}

export async function deleteProduct(id: string, token?: string): Promise<boolean> {
    try {
        await fetchApi(`/products/${id}`, {
            method: 'DELETE'
        }, token);
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}

export async function getCustomers(search?: string, token?: string): Promise<Customer[]> {
    try {
        const url = search ? `/customers?search=${encodeURIComponent(search)}` : '/customers';
        const customers = await fetchApi<any[]>(url, {}, token);
        let mapped = customers.map(c => ({
            ...c,
            id: String(c.id)
        })) as Customer[];

        if (search) {
            const lower = search.toLowerCase();
            mapped = mapped.filter(c => c.name.toLowerCase().includes(lower) || c.email.toLowerCase().includes(lower));
        }

        return mapped;
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

export async function getCustomer(id: string, token?: string): Promise<Customer | null> {
    try {
        const data = await fetchApi<any>(`/customers/${id}`, {}, token);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id)
        } as Customer;
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}



export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & { clerkId?: string }, token?: string): Promise<Customer | null> {
    try {
        const dto = {
            clerkId: customer.clerkId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            active: !!customer.active
        };

        const data = await fetchApi<any>('/customers', {
            method: 'POST',
            body: JSON.stringify(dto)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Customer;
    } catch (error) {
        console.error('Error creating customer:', error);
        return null;
    }
}

export async function updateCustomer(id: string, customer: Partial<Omit<Customer, 'id'>>, token?: string): Promise<Customer | null> {
    try {
        const dto: any = {};
        if (customer.name) dto.name = customer.name;
        if (customer.email) dto.email = customer.email;
        if (customer.phone !== undefined) dto.phone = customer.phone;
        if (customer.address !== undefined) dto.address = customer.address;
        if (customer.active !== undefined) dto.active = !!customer.active;

        const data = await fetchApi<any>(`/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Customer;
    } catch (error) {
        console.error('Error updating customer:', error);
        return null;
    }
}

export async function deleteCustomer(id: string, token?: string): Promise<boolean> {
    try {
        await fetchApi(`/customers/${id}`, {
            method: 'DELETE'
        }, token);
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        return false;
    }
}

export async function syncCustomerApi(user: { email: string; name: string }, token?: string): Promise<Customer | null> {
    try {
        const data = await fetchApi<any>('/customers/sync', {
            method: 'POST',
            body: JSON.stringify(user)
        }, token);
        return {
            ...data,
            id: String(data.id)
        } as Customer;
    } catch (error) {
        console.error('Error syncing customer:', error);
        return null;
    }
}


export async function getOrders(customerEmail?: string, search?: string, token?: string): Promise<Order[]> {
    try {
        let url = '/orders';
        const params = new URLSearchParams();
        if (customerEmail) params.append('customerEmail', customerEmail);
        if (search) params.append('search', search);
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const orders = await fetchApi<any[]>(url, {}, token);

        let mapped = orders.map(o => ({
            ...o,
            id: String(o.id),
            date: o.createdAt,
            total: Number(o.totalAmount),
            customerId: String(o.customerId),
            customer: o.customers ? {
                ...o.customers,
                id: String(o.customers.id)
            } : undefined
        })) as Order[];

        if (search) {
            const lower = search.toLowerCase();
            mapped = mapped.filter(o =>
                o.status.toLowerCase().includes(lower) ||
                o.customerId.toLowerCase().includes(lower) ||
                o.id.toLowerCase().includes(lower)
            );
        }

        return mapped;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export async function getOrder(id: string, token?: string): Promise<Order | null> {
    try {
        const data = await fetchApi<any>(`/orders/${id}`, {}, token);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id),
            date: data.createdAt,
            total: Number(data.totalAmount),
            customerId: String(data.customerId),
            customer: data.customers ? {
                ...data.customers,
                id: String(data.customers.id)
            } : undefined,
            items: (data.order_items || []).map((item: any) => ({
                ...item,
                id: String(item.id),
                productId: String(item.productId),
                unitPrice: Number(item.unitPrice),
                product: item.products ? {
                    ...item.products,
                    id: String(item.products.id),
                    image: item.products.imageUrl || item.products.image || '/placeholder.png',
                    categoryId: String(item.products.categoryId),
                    image_url: item.products.imageUrl || item.products.image || '/placeholder.png',
                    category_id: String(item.products.categoryId),
                    active: item.products.active !== undefined ? item.products.active : true
                } : undefined
            }))
        } as Order;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

export async function updateOrderStatus(id: string, status: string, token?: string): Promise<boolean> {
    try {
        await fetchApi(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        }, token);
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

export async function createOrder(orderDto: any, token?: string): Promise<Order | null> {
    try {
        const data = await fetchApi<any>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderDto)
        }, token);
        return {
            ...data,
            id: String(data.id),
        } as Order;
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
}
