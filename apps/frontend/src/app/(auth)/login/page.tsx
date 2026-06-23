import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <div className="auth-page">
            <Suspense fallback={<div>Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}

