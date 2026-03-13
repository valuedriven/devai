import { SignIn, SignedOut } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="auth-page">
            <SignedOut>
                <SignIn fallbackRedirectUrl="/" />
            </SignedOut>
        </div>
    );
}

