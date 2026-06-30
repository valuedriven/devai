import {
  Category,
  Product,
  Customer,
  Order,
  Payment,
  AuditLog,
} from './types';
import { fetchApi } from './api';

interface CategoryResponse {
  id: string | number;
  name: string;
  active: boolean;
}

interface ProductResponse {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  image?: string;
  stock: number;
  categoryId?: string | number;
  category_id?: string | number;
  active?: boolean;
}

interface CustomerResponse {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

interface OrderItemResponse {
  id: string | number;
  orderId?: string | number;
  order_id?: string | number;
  productId?: string | number;
  product_id?: string | number;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
  product?: ProductResponse;
  products?: ProductResponse;
}

interface OrderResponse {
  id: string | number;
  number?: string;
  customerId?: string | number;
  customer_id?: string | number;
  totalAmount?: number;
  total_amount?: number;
  status: string;
  shippingAddress?: string;
  shipping_address?: string;
  createdAt?: string;
  created_at?: string;
  orderItems?: OrderItemResponse[];
  order_items?: OrderItemResponse[];
  customer?: CustomerResponse;
  customers?: CustomerResponse;
  payments?: Payment[];
  auditLogs?: AuditLog[];
}

interface CreateOrderDto {
  customerId?: string;
  customer_id?: string;
  totalAmount?: number;
  total_amount?: number;
  shippingAddress?: string;
  shipping_address?: string;
  order_items?: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
  }>;
  orderItems?: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

interface UserProfileResponse {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  imageUrl?: string;
}

function toCategory(response: CategoryResponse): Category {
  return {
    ...response,
    id: String(response.id),
  };
}

function toProduct(response: ProductResponse): Product {
  const image = response.imageUrl || response.image || '/placeholder.png';
  return {
    ...response,
    id: String(response.id),
    description: response.description ?? '',
    image,
    image_url: image,
    categoryId: String(response.categoryId ?? response.category_id ?? ''),
    category_id: String(response.categoryId ?? response.category_id ?? ''),
    active: response.active ?? true,
  };
}

function toCustomer(response: CustomerResponse): Customer {
  return {
    ...response,
    id: String(response.id),
    phone: response.phone ?? '',
    address: response.address ?? '',
    active: response.active ?? true,
  };
}

function toOrderItem(item: OrderItemResponse): NonNullable<Order['items']>[number] {
  const rawProduct = item.product || item.products;
  return {
    ...item,
    id: String(item.id),
    order_id: String(item.orderId ?? item.order_id ?? ''),
    productId: String(item.productId ?? item.product_id ?? ''),
    product_id: String(item.productId ?? item.product_id ?? ''),
    unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
    unit_price: Number(item.unitPrice ?? item.unit_price ?? 0),
    product: rawProduct ? toProduct(rawProduct) : undefined,
  };
}

function toOrder(response: OrderResponse): Order {
  const rawItems = response.orderItems || response.order_items || [];
  const rawCustomer = response.customer || response.customers;
  return {
    ...response,
    id: String(response.id),
    number: response.number,
    customerId: String(response.customerId ?? response.customer_id ?? ''),
    customer_id: String(response.customerId ?? response.customer_id ?? ''),
    total: Number(response.totalAmount ?? response.total_amount ?? 0),
    total_amount: Number(response.totalAmount ?? response.total_amount ?? 0),
    date: response.createdAt ?? response.created_at ?? '',
    created_at: response.createdAt ?? response.created_at ?? '',
    updated_at: response.createdAt ?? response.created_at ?? '',
    status: response.status as Order['status'],
    shippingAddress: response.shippingAddress ?? response.shipping_address,
    shipping_address: response.shippingAddress ?? response.shipping_address,
    items: rawItems.map(toOrderItem),
    customer: rawCustomer ? toCustomer(rawCustomer) : undefined,
  };
}

function buildBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  return isServer
    ? process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3001/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
}

function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': '00000000-0000-0000-0000-000000000000',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getCategories(
  search?: string,
  token?: string,
): Promise<Category[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '100');

    const url = `/categories?${params.toString()}`;
    const response = await fetchApi<CategoryResponse[] | { data: CategoryResponse[] }>(
      url,
      {},
      token,
    );
    const categories = Array.isArray(response)
      ? response
      : response?.data || [];

    return categories.map(toCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getPaginatedCategories(
  options: {
    search?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  },
  token?: string,
): Promise<{ data: Category[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.includeInactive) params.append('includeInactive', 'true');

    const url = `/admin/categories?${params.toString()}`;
    const API_BASE_URL = buildBaseUrl();
    const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

    const response = await fetch(fullUrl, {
      headers: buildHeaders(token),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const rawData = await response.json();
    const categoryArray: CategoryResponse[] = Array.isArray(rawData) ? rawData : (rawData.data ?? []);
    const categories = categoryArray.map(toCategory);

    return { data: categories, total };
  } catch (error) {
    console.error('Error fetching paginated categories:', error);
    return { data: [], total: 0 };
  }
}

export async function getCategory(
  id: string,
  token?: string,
): Promise<Category | null> {
  try {
    const data = await fetchApi<CategoryResponse>(
      `/admin/categories/${id}`,
      {},
      token,
    );
    if (!data) return null;

    return toCategory(data);
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function createCategory(
  category: Omit<Category, 'id'>,
  token?: string,
): Promise<Category | null> {
  try {
    const data = await fetchApi<CategoryResponse>(
      '/admin/categories',
      {
        method: 'POST',
        body: JSON.stringify({ name: category.name }),
      },
      token,
    );
    return toCategory(data);
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
}

export async function updateCategory(
  id: string,
  category: Partial<Omit<Category, 'id'>>,
  token?: string,
): Promise<Category | null> {
  try {
    const dto: Record<string, unknown> = {};
    if (category.name !== undefined) dto.name = category.name;
    if (category.active !== undefined) dto.active = category.active;

    const data = await fetchApi<CategoryResponse>(
      `/admin/categories/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(dto),
      },
      token,
    );
    return toCategory(data);
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
}

export async function deleteCategory(
  id: string,
  token?: string,
): Promise<boolean> {
  try {
    await fetchApi(`/admin/categories/${id}`, {
      method: 'DELETE',
    }, token);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
}

export async function getProducts(
  search?: string,
  categoryId?: string,
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    const url = params.toString() ? `/products?${params.toString()}` : '/products';
    const products = await fetchApi<ProductResponse[]>(url);
    return products.map(toProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getPaginatedProducts(
  options: {
    search?: string;
    page?: number;
    limit?: number;
    categoryId?: string;
    includeInactive?: boolean;
  },
  token?: string,
): Promise<{ data: Product[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.categoryId) params.append('categoryId', options.categoryId);
    if (options.includeInactive) params.append('includeInactive', 'true');

    const url = `/admin/products?${params.toString()}`;
    const API_BASE_URL = buildBaseUrl();
    const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

    const response = await fetch(fullUrl, {
      headers: buildHeaders(token),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const rawData = await response.json();
    const productArray: ProductResponse[] = Array.isArray(rawData) ? rawData : (rawData.data ?? []);
    const products = productArray.map(toProduct);

    return { data: products, total };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    return { data: [], total: 0 };
  }
}

export async function getProduct(
  id: string,
  token?: string,
): Promise<Product | null> {
  try {
    const data = await fetchApi<ProductResponse>(`/products/${id}`, {}, token);
    if (!data) return null;

    return toProduct(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProduct(
  product: Omit<Product, 'id'>,
  token?: string,
): Promise<Product | null> {
  try {
    const dto = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.image_url || product.image,
      categoryId: String(product.category_id || product.categoryId),
      stock: Number(product.stock),
      active: !!product.active,
    };

    const data = await fetchApi<ProductResponse>(
      '/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      token,
    );
    return toProduct(data);
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, 'id'>>,
  token?: string,
): Promise<Product | null> {
  try {
    const dto: Record<string, unknown> = {};
    if (product.name) dto.name = product.name;
    if (product.description) dto.description = product.description;
    if (product.price !== undefined) dto.price = Number(product.price);
    if (product.image_url || product.image)
      dto.imageUrl = product.image_url || product.image;
    if (product.category_id || product.categoryId)
      dto.categoryId = String(product.category_id || product.categoryId);
    if (product.stock !== undefined) dto.stock = Number(product.stock);
    if (product.active !== undefined) dto.active = !!product.active;

    const data = await fetchApi<ProductResponse>(
      `/admin/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(dto),
      },
      token,
    );
    return toProduct(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(
  id: string,
  token?: string,
): Promise<boolean> {
  try {
    await fetchApi(`/admin/products/${id}`, {
      method: 'DELETE',
    }, token);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

export async function uploadProductImage(
  file: File,
  token?: string,
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const API_BASE_URL = buildBaseUrl();
    const fullUrl = `${API_BASE_URL}/admin/products/upload`;

    const headers: Record<string, string> = {
      'X-Tenant-ID': '00000000-0000-0000-0000-000000000000',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as { imageUrl?: string };
    return data.imageUrl || null;
  } catch (error) {
    console.error('Error uploading product image:', error);
    return null;
  }
}

export async function getCustomers(
  search?: string,
  token?: string,
): Promise<Customer[]> {
  try {
    const url = search
      ? `/customers?search=${encodeURIComponent(search)}`
      : '/customers';
    const customers = await fetchApi<CustomerResponse[]>(url, {}, token);
    let mapped = customers.map(toCustomer);

    if (search) {
      const lower = search.toLowerCase();
      mapped = mapped.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower),
      );
    }

    return mapped;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

export async function getCustomer(
  id: string,
  token?: string,
): Promise<Customer | null> {
  try {
    const data = await fetchApi<CustomerResponse>(`/customers/${id}`, {}, token);
    if (!data) return null;

    return toCustomer(data);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

export async function createCustomer(
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & {
    clerkId?: string;
  },
  token?: string,
): Promise<Customer | null> {
  try {
    const dto = {
      clerkId: customer.clerkId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      active: !!customer.active,
    };

    const data = await fetchApi<CustomerResponse>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      token,
    );
    return toCustomer(data);
  } catch (error) {
    console.error('Error creating customer:', error);
    return null;
  }
}

export async function updateCustomer(
  id: string,
  customer: Partial<Omit<Customer, 'id'>>,
  token?: string,
): Promise<Customer | null> {
  try {
    const dto: Record<string, unknown> = {};
    if (customer.name) dto.name = customer.name;
    if (customer.email) dto.email = customer.email;
    if (customer.phone !== undefined) dto.phone = customer.phone;
    if (customer.address !== undefined) dto.address = customer.address;
    if (customer.active !== undefined) dto.active = !!customer.active;

    const data = await fetchApi<CustomerResponse>(
      `/customers/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(dto),
      },
      token,
    );
    return toCustomer(data);
  } catch (error) {
    console.error('Error updating customer:', error);
    return null;
  }
}

export async function deleteCustomer(
  id: string,
  token?: string,
): Promise<boolean> {
  await fetchApi(`/customers/${id}`, {
    method: 'DELETE',
  }, token);
  return true;
}

export async function syncCustomerApi(
  user: { email: string; name: string },
  token?: string,
): Promise<Customer | null> {
  try {
    const data = await fetchApi<CustomerResponse>(
      '/customers/sync',
      {
        method: 'POST',
        body: JSON.stringify(user),
      },
      token,
    );
    return toCustomer(data);
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

    const response =
      (await fetchApi<{ data: OrderResponse[]; total: number }>(url, {}, token)) ??
      { data: [], total: 0 };

    const data = (response.data ?? []).map(toOrder);

    return { data, total: response.total ?? data.length };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { data: [], total: 0 };
  }
}

export async function getOrder(
  id: string,
  token?: string,
): Promise<Order | null> {
  try {
    const data = await fetchApi<OrderResponse>(`/orders/${id}`, {}, token);
    if (!data) return null;

    return toOrder(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  token?: string,
): Promise<boolean> {
  try {
    await fetchApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

export async function cancelOrder(
  id: string,
  token?: string,
): Promise<boolean> {
  try {
    await fetchApi(`/orders/${id}/cancel`, {
      method: 'POST',
    }, token);
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}

export async function createOrder(
  orderDto: CreateOrderDto,
  token?: string,
): Promise<Order | null> {
  try {
    const data = await fetchApi<OrderResponse>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(orderDto),
      },
      token,
    );
    return toOrder(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

export async function getOrderStatusTransitions(
  token?: string,
): Promise<Record<string, string[]>> {
  try {
    return await fetchApi<Record<string, string[]>>(
      '/admin/orders/config/transitions',
      {},
      token,
    );
  } catch (error) {
    console.error('Error fetching order status transitions:', error);
    return {};
  }
}

export async function getAdminOrders(
  token: string,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  },
): Promise<Order[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    const url = `/admin/orders${qs ? `?${qs}` : ''}`;

    const data = (await fetchApi<OrderResponse[]>(url, {}, token)) ?? [];

    return data.map(toOrder);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return [];
  }
}

export async function getAdminOrder(
  id: string,
  token: string,
): Promise<Order | null> {
  try {
    const data = await fetchApi<OrderResponse>(`/admin/orders/${id}`, {}, token);
    if (!data) return null;

    return toOrder(data);
  } catch (error) {
    console.error('Error fetching admin order:', error);
    return null;
  }
}

export async function transitionOrderStatus(
  id: string,
  status: string,
  notes?: string,
  token?: string,
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
  paymentData: {
    value: number;
    method: string;
    date: string;
    notes?: string;
    status?: string;
  },
  token?: string,
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

export async function getMe(
  token: string,
): Promise<UserProfileResponse | null> {
  try {
    return await fetchApi<UserProfileResponse>('/auth/me', {}, token);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
