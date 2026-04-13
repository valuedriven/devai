"use client";

import React from "react";
import { useAuthMe } from "@/hooks/useAuthMe";
import Image from "next/image";
import { User, Mail, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
    const { authMe, isLoading, isLoggedIn } = useAuthMe();

    if (isLoading) {
        return (
            <div className="container py-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-slate-200 rounded-full" />
                    <div className="h-8 w-48 bg-slate-200 rounded" />
                    <div className="h-4 w-64 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                <p className="text-muted-foreground">Você precisa estar logado para ver esta página.</p>
            </div>
        );
    }

    const roles = authMe?.roles || [];
    const displayName = authMe?.firstName ? `${authMe.firstName} ${authMe.lastName || ""}` : "Usuário";

    return (
        <div className="container py-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center gap-6">
                    {authMe?.imageUrl ? (
                        <Image 
                            src={authMe.imageUrl} 
                            alt="Profile" 
                            width={96} 
                            height={96} 
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" 
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
                            <User className="w-12 h-12 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                        <p className="text-muted-foreground">Gerencie suas informações de conta</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Detalhes da Conta
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">E-mail</p>
                                        <p className="text-sm text-muted-foreground">{authMe?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Cargos</p>
                                        <div className="flex gap-2 mt-1">
                                            {roles.length > 0 ? (
                                                roles.map(role => (
                                                    <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary uppercase tracking-wider">
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Cliente</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
