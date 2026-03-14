import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/hooks/AuthContext";
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
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
        <body className="font-sans min-h-screen flex">
          <CartProvider>
            <AuthProvider>
              <DesktopSidebar />
              <div className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-64">
                {children}
              </div>
            </AuthProvider>
          </CartProvider>
        </body>
    </html>
  );
}
