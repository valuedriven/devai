"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { getCustomerByClerkId, createCustomer } from "@/lib/data";

/**
 * Componente invisível que garante que o usuário do Clerk 
 * exista como um "Customer" no nosso banco de dados.
 */
export function UserSync() {
    const { user, isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        async function sync() {
            if (isLoaded && isSignedIn && user) {
                try {
                    // Verifica se o cliente já existe no nosso banco (usando o ID do Clerk)
                    const customer = await getCustomerByClerkId(user.id);

                    if (!customer) {
                        console.log("Customer não encontrado no banco, sincronizando proativamente...");

                        await createCustomer({
                            clerkId: user.id,
                            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Novo Cliente",
                            email: user.emailAddresses[0].emailAddress,
                            phone: "",
                            address: "",
                            active: true
                        });

                        console.log("Sincronização frontend concluída com sucesso.");
                    }
                } catch (error) {
                    console.error("Erro na sincronização proativa do usuário:", error);
                }
            }
        }

        sync();
    }, [isLoaded, isSignedIn, user]);

    return null;
}
