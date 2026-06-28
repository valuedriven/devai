/* eslint-disable @typescript-eslint/no-explicit-any */

import { Category, Product, Customer, Order } from './types';
import { fetchApi } from './api';

export async function getCategories(search?: string, token?: string): Promise<Category[]> {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('limit', '100'); // fetch up to 100 for client-side table pagination

        const url = `/categories?${params.toString()}`;
        const response = await fetchApi<any>(url, {}, token);
        const categories = Array.isArray(response) ? response : (response?.data || []);
        
        return categories.map((cat: any) => ({
            ...cat,
            id: String(cat.id),
        })) as Category[];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getPaginatedCategories(
    options: { search?: string; page?: number; limit?: number; includeInactive?: boolean },
    token?: string
): Promise<{ data: Category[]; total: number }> {
    try {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.page) params.append('page', String(options.page));
        if (options.limit) params.append('limit', String(options.limit));
        if (options.includeInactive) params.append('includeInactive', 'true');

        const url = `/admin/categories?${params.toString()}`;
        
        // We need custom fetch to get headers
        const isServer = typeof window === 'undefined';
        const API_BASE_URL = isServer
            ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
            : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
            
        const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Tenant-ID': '00000000-0000-0000-0000-000000000000',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(fullUrl, { headers, cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
        const data = await response.json();
        const categories = (data.data || data || []).map((cat: any) => ({
            ...cat,
            id: String(cat.id),
        })) as Category[];
        
        return { data: categories, total };
    } catch (error) {
        console.error('Error fetching paginated categories:', error);
        return { data: [], total: 0 };
    }
}

export async function getCategory(id: string, token?: string): Promise<Category | null> {
    try {
        const data = await fetchApi<any>(`/admin/categories/${id}`, {}, token);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id),
        } as Category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

export async function createCategory(category: Omit<Category, 'id'>, token?: string): Promise<Category | null> {
    try {
        const data = await fetchApi<any>('/admin/categories', {
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
        if (category.name !== undefined) dto.name = category.name;
        if (category.active !== undefined) dto.active = category.active;

        const data = await fetchApi<any>(`/admin/categories/${id}`, {
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
        await fetchApi(`/admin/categories/${id}`, {
            method: 'DELETE'
        }, token);
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
}

export async function getProducts(search?: string, categoryId?: string): Promise<Product[]> {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);
        const url = params.toString() ? `/products?${params.toString()}` : '/products';
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

export async function getPaginatedProducts(
    options: { search?: string; page?: number; limit?: number; categoryId?: string; includeInactive?: boolean },
    token?: string
): Promise<{ data: Product[]; total: number }> {
    try {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.page) params.append('page', String(options.page));
        if (options.limit) params.append('limit', String(options.limit));
        if (options.categoryId) params.append('categoryId', options.categoryId);
        if (options.includeInactive) params.append('includeInactive', 'true');

        const url = `/admin/products?${params.toString()}`;
        
        const isServer = typeof window === 'undefined';
        const API_BASE_URL = isServer
            ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
            : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
            
        const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Tenant-ID': '00000000-0000-0000-0000-000000000000',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(fullUrl, { headers, cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
        const data = await response.json();
        const products = (data.data || data || []).map((p: any) => ({
            ...p,
            id: String(p.id),
            image: p.imageUrl || p.image || '/placeholder.png',
            categoryId: String(p.categoryId),
            image_url: p.imageUrl || p.image || '/placeholder.png',
            category_id: String(p.categoryId),
            active: p.active !== undefined ? p.active : true
        })) as Product[];
        
        return { data: products, total };
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        return { data: [], total: 0 };
    }
}

export async function getProduct(id: string, token?: string): Promise<Product | null> {
    try {
        const data = await fetchApi<any>(`/products/${id}`, {}, token);
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

        const data = await fetchApi<any>('/admin/products', {
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

        const data = await fetchApi<any>(`/admin/products/${id}`, {
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
        await fetchApi(`/admin/products/${id}`, {
            method: 'DELETE'
        }, token);
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}

export async function uploadProductImage(file: File, token?: string): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const isServer = typeof window === 'undefined';
        const API_BASE_URL = isServer
            ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
            : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');
            
        const fullUrl = `${API_BASE_URL}/admin/products/upload`;
        
        const headers: Record<string, string> = {
            'X-Tenant-ID': '00000000-0000-0000-0000-000000000000',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        // Let the browser set Content-Type for FormData
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers,
            body: formData,
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.imageUrl || null;
    } catch (error) {
        console.error('Error uploading product image:', error);
        return null;
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
    await fetchApi(`/customers/${id}`, {
        method: 'DELETE'
    }, token);
    return true;
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


export async function getOrders(
    customerEmail?: string,
    search?: string,
    token?: string,
    page?: number,
    limit?: number,
    status?: string,
): Promise<{ data: Order[]; total: number }> {
    try {
        const params = new URLSearchParams();
        if (customerEmail) params.append('customerEmail', customerEmail);
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (page) params.append('page', String(page));
        if (limit) params.append('limit', String(limit));
        const qs = params.toString();
        const url = `/orders${qs ? `?${qs}` : ''}`;

        const response = await fetchApi<{ data: any[]; total: number }>(url, {}, token) ?? { data: [], total: 0 };

        const data = (response.data ?? response).map((o: any) => ({
            ...o,
            id: String(o.id),
            date: o.createdAt,
            total: Number(o.totalAmount),
            customerId: String(o.customerId),
            customer: o.customer ? {
                ...o.customer,
                id: String(o.customer.id)
            } : o.customers ? {
                ...o.customers,
                id: String(o.customers.id)
            } : undefined
        })) as Order[];

        return { data, total: response.total ?? data.length };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { data: [], total: 0 };
    }
}

export async function getOrder(id: string, token?: string): Promise<Order | null> {
    try {
        const data = await fetchApi<any>(`/orders/${id}`, {}, token);
        if (!data) return null;

        const rawItems = data.orderItems || data.order_items || [];

        return {
            ...data,
            id: String(data.id),
            date: data.createdAt,
            total: Number(data.totalAmount),
            customerId: String(data.customerId),
            customer: data.customer ? {
                ...data.customer,
                id: String(data.customer.id)
            } : data.customers ? {
                ...data.customers,
                id: String(data.customers.id)
            } : undefined,
            items: rawItems.map((item: any) => {
                const rawProduct = item.product || item.products;
                return {
                    ...item,
                    id: String(item.id),
                    productId: String(item.productId),
                    unitPrice: Number(item.unitPrice),
                    product: rawProduct ? {
                        ...rawProduct,
                        id: String(rawProduct.id),
                        image: rawProduct.imageUrl || rawProduct.image || '/placeholder.png',
                        categoryId: String(rawProduct.categoryId),
                        image_url: rawProduct.imageUrl || rawProduct.image || '/placeholder.png',
                        category_id: String(rawProduct.categoryId),
                        active: rawProduct.active !== undefined ? rawProduct.active : true
                    } : undefined
                };
            })
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

export async function cancelOrder(id: string, token?: string): Promise<boolean> {
    try {
        await fetchApi(`/orders/${id}/cancel`, {
            method: 'POST'
        }, token);
        return true;
    } catch (error) {
        console.error('Error cancelling order:', error);
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
export async function getOrderStatusTransitions(token?: string): Promise<Record<string, string[]>> {
    try {
        return await fetchApi<Record<string, string[]>>('/admin/orders/config/transitions', {}, token);
    } catch (error) {
        console.error('Error fetching order status transitions:', error);
        return {};
    }
}

export async function getAdminOrders(
    token: string,
    filters?: { status?: string; startDate?: string; endDate?: string; search?: string }
): Promise<Order[]> {
    try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.search) params.append('search', filters.search);
        
        const qs = params.toString();
        const url = `/admin/orders${qs ? `?${qs}` : ''}`;

        const data = await fetchApi<any[]>(url, {}, token) ?? [];

        return data.map((o: any) => ({
            ...o,
            id: String(o.id),
            date: o.createdAt,
            total: Number(o.totalAmount),
            customerId: String(o.customerId),
        })) as Order[];
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }
}

export async function getAdminOrder(id: string, token: string): Promise<Order | null> {
    try {
        const data = await fetchApi<any>(`/admin/orders/${id}`, {}, token);
        if (!data) return null;

        return {
            ...data,
            id: String(data.id),
            date: data.createdAt,
            total: Number(data.totalAmount),
            customerId: String(data.customerId),
            items: (data.orderItems || []).map((item: any) => ({
                ...item,
                id: String(item.id),
                productId: String(item.productId),
                unitPrice: Number(item.unitPrice),
            })),
        } as Order;
    } catch (error) {
        console.error('Error fetching admin order:', error);
        return null;
    }
}

export async function transitionOrderStatus(
    id: string,
    status: string,
    notes?: string,
    token?: string
): Promise<boolean> {
    try {
        await fetchApi(`/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes }),
        }, token);
        return true;
    } catch (error) {
        console.error('Error transitioning order status:', error);
        return false;
    }
}

export async function registerPayment(
    orderId: string,
    paymentData: { value: number; method: string; date: string; notes?: string; status?: string },
    token?: string
): Promise<boolean> {
    try {
        await fetchApi(`/admin/orders/${orderId}/payments`, {
            method: 'POST',
            body: JSON.stringify(paymentData),
        }, token);
        return true;
    } catch (error) {
        console.error('Error registering payment:', error);
        return false;
    }
}

export async function getMe(token: string): Promise<any> {
    try {
        return await fetchApi<any>('/auth/me', {}, token);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

