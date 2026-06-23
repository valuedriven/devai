import { api } from "./api";
import type { Order } from "@/types/models";

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreateOrderPayload {
  customer_id: string;
  items: { product_id: string; quantity: number }[];
  shipping_address?: string;
}

export const ordersService = {
  list(params?: OrderListParams): Promise<Order[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return api.get<Order[]>(`/orders${qs ? `?${qs}` : ""}`);
  },

  getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  create(data: CreateOrderPayload): Promise<Order> {
    return api.post<Order>("/orders", data);
  },

  updateStatus(id: string, status: string): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/status`, { status });
  },
};
