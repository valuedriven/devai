import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Entrar na Devia</h1>
                    <p className="auth-subtitle">
                        Digite seu e-mail e senha para acessar sua conta
                    </p>
                </div>

                <div className="auth-form">
                    <div className="auth-form-group">
                        <label htmlFor="email" className="auth-label">
                            E-mail
                        </label>
                        <Input id="email" placeholder="seu@email.com" type="email" />
                    </div>
                    <div className="auth-form-group">
                        <label htmlFor="password" className="auth-label">
                            Senha
                        </label>
                        <Input id="password" type="password" />
                    </div>

                    <Button className="w-full">Entrar</Button>
                </div>

                <div className="auth-footer">
                    <div>
                        Não tem uma conta?{" "}
                        <Link href="/register" className="auth-link">
                            Criar conta
                        </Link>
                    </div>
                    <div>
                        <Link href="/" className="auth-back-link">Voltar para a loja</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
