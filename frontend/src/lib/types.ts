export type OrderStatus = 'Novo' | 'Pago' | 'Preparação' | 'Faturado' | 'Despachado' | 'Entregue' | 'Cancelado';

export interface Category {
    id: string;
    name: string;
    active: boolean;
    tenant_id?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock: number;
    category_id: string;
    active: boolean;
    tenant_id?: string;
    // Compatibility fields
    image: string;
    categoryId: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    active: boolean;
    tenant_id?: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    // Compatibility fields
    productId: string;
    unitPrice: number;
    // UI helper properties
    product?: Product;
}

export interface Order {
    id: string;
    customer_id: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address?: string;
    payment_method?: string;
    payment_date?: string;
    created_at: string;
    updated_at: string;
    tenant_id?: string;
    // Nested structure for UI convenience
    items?: OrderItem[];
    // Backwards compatibility with mock data fields
    date: string;
    total: number;
    customerId: string;
}
