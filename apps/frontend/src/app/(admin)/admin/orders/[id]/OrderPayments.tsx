import { Payment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PaymentRegistrationModal } from "./PaymentRegistrationModal";

export function OrderPayments({ orderId, payments }: { orderId: string, payments: Payment[] }) {
    const paymentToneMap: Record<string, "neutral" | "success" | "info" | "error" | "warning"> = {
        "Pending": "warning",
        "Confirmed": "success",
        "Refunded": "error",
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <PaymentRegistrationModal orderId={orderId} />
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Data</th>
                                <th className="px-4 py-2 text-left">Método</th>
                                <th className="px-4 py-2 text-right">Valor</th>
                                <th className="px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{p.method}</td>
                                    <td className="px-4 py-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <Badge tone={paymentToneMap[p.status] || "neutral"}>
                                            {p.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground italic">Nenhum pagamento registrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
