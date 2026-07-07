import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import TrustBar from "@/components/layout/TrustBar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ToastProvider from "@/components/ui/ToastProvider";
import AppHydrator from "@/components/layout/AppHydrator";
import FlyToCartProvider from "@/components/motion/FlyToCartProvider";
import ScrollProgress from "@/components/motion/ScrollProgress";
import ThemeProvider from "@/components/theme/ThemeProvider";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apple Store — iPhone, MacBook, iPad, Watch, AirPods",
  description:
    "Shop the latest iPhone, MacBook, iPad, Apple Watch, and AirPods. Fast checkout, free shipping, and easy returns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body bg-background text-ink antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <FlyToCartProvider>
            <ScrollProgress />
            <AppHydrator />
            <TrustBar />
            <Navbar />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastProvider />
          </FlyToCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
