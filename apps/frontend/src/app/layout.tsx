import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/lib/CartContext";
import { UserSync } from "@/components/auth/UserSync";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevAI | Premium E-commerce",
  description: "Experience the future of shopping with DevAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} localization={ptBR}>
      <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
        <body className="font-sans min-h-screen flex">
          <UserSync />
          <CartProvider>
            <DesktopSidebar />
            <div className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-64">
              {children}
            </div>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
