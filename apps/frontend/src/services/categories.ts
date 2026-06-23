import { api } from "./api";
import type { Category } from "@/types/models";

export interface CategoryListParams {
  page?: number;
  limit?: number;
  active?: boolean;
}

export const categoriesService = {
  list(params?: CategoryListParams): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.active !== undefined) searchParams.set("active", String(params.active));
    const qs = searchParams.toString();
    return api.get<Category[]>(`/categories${qs ? `?${qs}` : ""}`);
  },

  getById(id: string): Promise<Category> {
    return api.get<Category>(`/categories/${id}`);
  },

  create(data: Partial<Category>): Promise<Category> {
    return api.post<Category>("/categories", data);
  },

  update(id: string, data: Partial<Category>): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return api.delete<void>(`/categories/${id}`);
  },
};
