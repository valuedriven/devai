import { api } from "./api";
import type { Product } from "@/types/models";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  active?: boolean;
}

export const productsService = {
  list(params?: ProductListParams): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category_id) searchParams.set("category_id", params.category_id);
    if (params?.active !== undefined) searchParams.set("active", String(params.active));
    const qs = searchParams.toString();
    return api.get<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  getById(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },

  create(data: Partial<Product>): Promise<Product> {
    return api.post<Product>("/products", data);
  },

  update(id: string, data: Partial<Product>): Promise<Product> {
    return api.put<Product>(`/products/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return api.delete<void>(`/products/${id}`);
  },
};
