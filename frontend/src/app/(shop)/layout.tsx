import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-16 bg-background border-b" />}>
                <Header />
            </Suspense>
            <main className="flex-1 bg-background">
                {children}
            </main>
            <Footer />
        </div>
    );
}
