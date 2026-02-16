import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/lib/CartContext";
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
  title: "Devia | Premium E-commerce",
  description: "Experience the future of shopping with Devia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <CartProvider>
        <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
          <body className="font-sans min-h-screen flex flex-col">{children}</body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
