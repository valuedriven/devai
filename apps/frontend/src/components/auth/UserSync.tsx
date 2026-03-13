"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { syncCustomerApi } from "@/lib/data";

/**
 * Componente invisível que garante que o usuário do Clerk 
 * exista como um "Customer" no nosso banco de dados.
 */
export function UserSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const syncedRef = useRef(false);

    useEffect(() => {
        async function sync() {
            if (isLoaded && isSignedIn && user && !syncedRef.current) {
                try {
                    const token = await getToken();
                    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Novo Cliente";
                    const email = user.emailAddresses[0]?.emailAddress;

                    if (email && token) {
                        console.log("Sincronizando usuário com o backend...");
                        await syncCustomerApi({ email, name }, token);
                        console.log("Sincronização backend concluída com sucesso.");
                        syncedRef.current = true;
                    }
                } catch (error) {
                    console.error("Erro na sincronização proativa do usuário:", error);
                }
            }
        }

        sync();
    }, [isLoaded, isSignedIn, user, getToken]);

    return null;
}
