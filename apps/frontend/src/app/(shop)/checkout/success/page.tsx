"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("id");

    return (
        <div className="order-success-container" data-testid="order-success-container">
            <CheckCircle className="order-success-icon text-success h-16 w-16 mx-auto mb-4" />
            <h1 className="order-success-title text-3xl font-bold text-center" data-testid="order-success-title">
                Pedido Confirmado!
            </h1>
            {orderId && (
                <p className="order-success-text text-center text-lg mt-2">
                    Seu pedido <strong>#{orderId}</strong> foi realizado com sucesso.
                </p>
            )}
            <p className="order-success-subtext text-center text-muted-foreground mt-1">
                Você receberá uma confirmação por e-mail em breve.
            </p>
            <div className="order-success-actions flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button size="lg" onClick={() => router.push("/orders")}>
                    Ver Meus Pedidos
                </Button>
                <Link href="/">
                    <Button variant="outline" size="lg">
                        Continuar comprando
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <div className="container py-12">
            <Suspense fallback={<div className="text-center">Carregando...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
