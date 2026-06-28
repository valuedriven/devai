"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { transitionOrderStatusAction } from "@/lib/actions";
import { getOrderStatusTransitions } from "@/lib/data";
import { useToast } from "@/components/ui/toast-context";

export function StatusActions({ orderId, currentStatus, token }: { orderId: string, currentStatus: string, token?: string }) {
    const [loading, setLoading] = useState(false);
    const [transitions, setTransitions] = useState<Record<string, string[]>>({});
    const { addToast } = useToast();

    useEffect(() => {
        getOrderStatusTransitions(token).then(setTransitions);
    }, [token]);

    const handleTransition = async (status: string) => {
        if (!confirm(`Deseja realmente alterar o status para ${status}?`)) return;
        
        setLoading(true);
        const success = await transitionOrderStatusAction(orderId, status);
        setLoading(false);
        
        if (success) {
            addToast("Status atualizado com sucesso!", "success");
        } else {
            addToast("Erro ao atualizar status. Verifique se a transição é permitida.", "error");
        }
    };

    const allowed = transitions[currentStatus] || [];

    return (
        <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Próximos Passos</div>
            {allowed.map((status) => (
                <Button
                    key={status}
                    variant={status === 'Cancelado' ? 'outline' : 'primary'}
                    onClick={() => handleTransition(status)}
                    disabled={loading}
                    className="w-full justify-start h-10"
                >
                    {status === 'Pago' && "Confirmar Pagamento"}
                    {status === 'Preparação' && "Iniciar Preparação"}
                    {status === 'Faturado' && "Emitir Nota Fiscal"}
                    {status === 'Despachado' && "Despachar Pedido"}
                    {status === 'Entregue' && "Confirmar Entrega"}
                    {status === 'Cancelado' && "Cancelar Pedido"}
                </Button>
            ))}
            {allowed.length === 0 && (
                <div className="text-sm text-slate-400 italic py-2">Nenhuma ação disponível para este status.</div>
            )}
        </div>
    );
}
