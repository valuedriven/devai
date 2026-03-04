import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="auth-page">
            <SignIn fallbackRedirectUrl="/admin" />
        </div>
    );
}

