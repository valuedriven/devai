"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function OrderFilters({ 
    currentStatus, 
    currentStartDate, 
    currentEndDate 
}: { 
    currentStatus?: string;
    currentStartDate?: string;
    currentEndDate?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex gap-4 items-center">
            <select 
                value={currentStatus || ""} 
                onChange={(e) => updateFilter('status', e.target.value)}
                className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Todos os Status</option>
                <option value="New">Novo</option>
                <option value="Paid">Pago</option>
                <option value="Preparation">Em Preparação</option>
                <option value="Invoiced">Faturado</option>
                <option value="Shipped">Enviado</option>
                <option value="Delivered">Entregue</option>
                <option value="Cancelled">Cancelado</option>
            </select>

            <div className="flex items-center gap-2">
                <input 
                    type="date"
                    value={currentStartDate || ""}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-400 text-sm">até</span>
                <input 
                    type="date"
                    value={currentEndDate || ""}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
}
