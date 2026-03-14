"use client";

import { useInternalAuth } from "./AuthContext";

export interface AuthMe {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    imageUrl: string;
}

export function useAuthMe() {
    const { user, isAuthenticated, isLoading } = useInternalAuth();

    const isAdmin = user?.roles?.includes("admin") || false;

    return {
        authMe: user as unknown as AuthMe,
        isAdmin,
        isLoading,
        isLoggedIn: isAuthenticated,
    };
}
