import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function EditCategoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/categories" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-3xl font-bold">Editar Categoria</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Dados da Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome da Categoria</label>
                        <Input placeholder="Ex: Informática" defaultValue="Informática" />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <label htmlFor="active" className="text-sm font-medium">Categoria Ativa</label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Link href="/admin/categories">
                        <Button variant="outline">Cancelar</Button>
                    </Link>
                    <Button>Salvar Categoria</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
