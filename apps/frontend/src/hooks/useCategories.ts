"use client";

import { useState, useEffect, useMemo } from "react";
import { Category } from "@/types/models";
import { categoriesService, CategoryListParams } from "@/services/categories";
import { useAuth } from "@clerk/nextjs";

interface UseCategoriesOptions {
  pageSize?: number;
  searchDebounceMs?: number;
}

interface UseCategoriesReturn {
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  search: string;
  includeInactive: boolean;
  setSearch: (search: string) => void;
  setIncludeInactive: (include: boolean) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { pageSize = 20, searchDebounceMs = 300 } = options;
  
  const { getToken } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchState] = useState("");
  const [includeInactive, setIncludeInactiveState] = useState(false);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, searchDebounceMs);
    
    return () => clearTimeout(timer);
  }, [search, searchDebounceMs]);
  
  const fetchCategories = useMemo(() => async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const params: CategoryListParams = {
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        includeInactive,
      };
      
      const response = await categoriesService.list(params, token);
      setCategories(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, includeInactive, getToken]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return {
    categories,
    total,
    page,
    totalPages,
    isLoading,
    error,
    search,
    includeInactive,
    setSearch: setSearchState,
    setIncludeInactive: setIncludeInactiveState,
    setPage,
    refresh: fetchCategories,
  };
}