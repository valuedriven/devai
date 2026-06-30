"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerPaymentAction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";

export function PaymentRegistrationModal({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        value: "",
        method: "Credit Card",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        status: "Confirmed"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await registerPaymentAction(orderId, {
            ...formData,
            value: parseFloat(formData.value)
        });
        setLoading(true); // Keep loading while redirecting/revalidating
        if (success) {
            addToast("Pagamento registrado com sucesso!", "success");
            setIsOpen(false);
            setFormData({
                value: "",
                method: "Credit Card",
                date: new Date().toISOString().split('T')[0],
                notes: "",
                status: "Confirmed"
            });
        } else {
            addToast("Erro ao registrar pagamento.", "error");
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Registrar Pagamento
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Registrar Pagamento</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-900">
                    <div className="space-y-1">
                        <label htmlFor="payment-value" className="text-sm font-semibold text-slate-700">Valor do pagamento</label>
                        <Input
                            id="payment-value"
                            type="number"
                            step="0.01"
                            required
                            placeholder="0,00"
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Método</label>
                        <select 
                            className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.method}
                            onChange={(e) => setFormData({...formData, method: e.target.value})}
                        >
                            <option value="Credit Card">Cartão de Crédito</option>
                            <option value="Pix">Pix</option>
                            <option value="Bank Slip">Boleto Bancário</option>
                            <option value="Cash">Dinheiro</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Data</label>
                        <Input 
                            type="date" 
                            required 
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Notas</label>
                        <textarea 
                            className="w-full p-2 border border-slate-300 rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observações sobre o pagamento..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Registrando..." : "Registrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
