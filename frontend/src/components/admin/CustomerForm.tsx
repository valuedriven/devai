import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export function CustomerForm() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo</label>
                    <Input placeholder="Ex: João Silva" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">E-mail</label>
                        <Input type="email" placeholder="joao@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone</label>
                        <Input placeholder="(11) 99999-9999" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input placeholder="Rua, Número, Bairro, Cidade - UF" />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="active" className="text-sm font-medium">Cliente Ativo</label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href="/admin/customers">
                    <Button variant="outline">Cancelar</Button>
                </Link>
                <Button>Salvar Cliente</Button>
            </CardFooter>
        </Card>
    );
}
