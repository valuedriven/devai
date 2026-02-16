import { supabase } from './supabase';
import { Category, Product, Customer, Order, OrderItem } from './types';

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return (data || []).map(cat => ({
        ...cat,
        id: String(cat.id)
    })) as Category[];
}

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return (data || []).map(p => ({
        ...p,
        id: String(p.id),
        image: p.image_url,
        categoryId: String(p.category_id)
    })) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return {
        ...data,
        id: String(data.id),
        image: data.image_url,
        categoryId: String(data.category_id)
    } as Product;
}

export async function getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return (data || []).map(c => ({
        ...c,
        id: String(c.id)
    })) as Customer[];
}

export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return (data || []).map(o => ({
        ...o,
        id: String(o.id),
        date: o.created_at,
        total: Number(o.total_amount),
        customerId: String(o.customer_id)
    })) as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return {
        ...data,
        id: String(data.id),
        date: data.created_at,
        total: Number(data.total_amount),
        customerId: String(data.customer_id),
        items: (data.order_items || []).map((item: any) => ({
            ...item,
            id: String(item.id),
            productId: String(item.product_id),
            unitPrice: Number(item.unit_price)
        }))
    } as Order;
}
