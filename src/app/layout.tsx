import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-context";
import { CartProvider } from "@/components/cart/cart-context";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Seravia — Doctor's science for Indian skin",
    template: "%s · Seravia",
  },
  description:
    "Seravia Lifesciences is doctor-owned skincare formulated for Indian skin and climate. Named actives, stated concentrations, and routines for pigmentation, acne, tanning and barrier stress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
