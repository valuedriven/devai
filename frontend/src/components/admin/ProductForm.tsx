import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCategories } from "@/lib/data";

export async function ProductForm() {
    const categories = await getCategories();
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Dados do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Produto</label>
                    <Input placeholder="Ex: Smartphone X" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preço (R$)</label>
                        <Input type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estoque</label>
                        <Input type="number" placeholder="0" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Descrição detalhada do produto..."></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">URL da Imagem</label>
                    <Input placeholder="https://..." />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="active" className="text-sm font-medium">Produto Ativo</label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href="/admin/products">
                    <Button variant="outline">Cancelar</Button>
                </Link>
                <Button>Salvar Produto</Button>
            </CardFooter>
        </Card>
    );
}
