import { AuditLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface StatusChangePayload {
    from?: string;
    to?: string;
    notes?: string;
}

function getPayload(log: AuditLog): StatusChangePayload | null {
    if (!log.payload) return null;
    return log.payload as StatusChangePayload;
}

export function OrderTimeline({ logs }: { logs: AuditLog[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Linha do Tempo / Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                    {logs.map((log) => {
                        const payload = getPayload(log);
                        return (
                            <div key={log.id} className="relative">
                                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-white border-2 border-blue-500" />
                                <div className="text-sm font-semibold">{log.action === 'STATUS_CHANGE' ? 'Alteração de Status' : log.action}</div>
                                <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</div>
                                {payload && (
                                    <div className="mt-1 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                        {payload.from && payload.to && (
                                            <div className="flex gap-2 items-center">
                                                <span className="text-slate-500 line-through">{payload.from}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className="font-medium text-blue-600">{payload.to}</span>
                                            </div>
                                        )}
                                        {payload.notes && (
                                            <div className="mt-1 italic text-slate-500">&ldquo;{payload.notes}&rdquo;</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {logs.length === 0 && <div className="text-muted-foreground italic text-sm">Nenhuma atividade registrada.</div>}
                </div>
            </CardContent>
        </Card>
    );
}
