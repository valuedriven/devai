import { api } from "./api";
import type { Category } from "@/types/models";

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}

export interface CategoryListResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
  active?: boolean;
}

export const categoriesService = {
  /**
   * List categories with pagination, search, and filter options.
   * Requires admin authentication.
   */
  list(params?: CategoryListParams, token?: string): Promise<CategoryListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.includeInactive) searchParams.set("includeInactive", "true");
    const qs = searchParams.toString();
    return api.get<CategoryListResponse>(`/admin/categories${qs ? `?${qs}` : ""}`, { token });
  },

  /**
   * Get a single category by ID.
   * Requires admin authentication.
   */
  getById(id: string, token?: string): Promise<Category> {
    return api.get<Category>(`/admin/categories/${id}`, { token });
  },

  /**
   * Create a new category.
   * Requires admin authentication.
   */
  create(data: CreateCategoryDto, token?: string): Promise<Category> {
    return api.post<Category>("/admin/categories", data, { token });
  },

  /**
   * Update an existing category.
   * Requires admin authentication.
   */
  update(id: string, data: UpdateCategoryDto, token?: string): Promise<Category> {
    return api.patch<Category>(`/admin/categories/${id}`, data, { token });
  },

  /**
   * Delete (soft delete) a category.
   * Requires admin authentication.
   * Returns 204 No Content on success.
   */
  delete(id: string, token?: string): Promise<void> {
    return api.delete<void>(`/admin/categories/${id}`, { token });
  },

  /**
   * Public endpoint: List active categories only.
   * No authentication required.
   */
  listPublic(params?: { page?: number; limit?: number; search?: string }): Promise<CategoryListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return api.get<CategoryListResponse>(`/categories${qs ? `?${qs}` : ""}`);
  },
};