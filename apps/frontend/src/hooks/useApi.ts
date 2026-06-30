"use client";

import { useState, useEffect, useRef } from "react";
import { ServiceError } from "@/types/api";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loadedKey: string | null;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loadedKey: null,
  });
  const [refetchToken, setRefetchToken] = useState(0);

  const fetcherRef = useRef(fetcher);
  const depsKey = JSON.stringify(deps);
  const requestKey = `${refetchToken}:${depsKey}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    let cancelled = false;

    fetcherRef.current()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, loadedKey: requestKey });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof ServiceError
              ? err.message
              : "An unexpected error occurred";
          setState({ data: null, error: message, loadedKey: requestKey });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const refetch = () => {
    setRefetchToken((token) => token + 1);
  };

  return {
    data: state.data,
    loading: state.loadedKey !== requestKey,
    error: state.error,
    refetch,
  };
}
