import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ShopStateProvider } from "@/components/shop-state";
import { AuthStateProvider } from "@/components/auth-state";
import { LoadingFeedback } from "@/components/loading-feedback";
import { BackToTopButton } from "@/components/back-to-top";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VINI RO | Premium RO Systems, Spare Parts & Service",
  description: "Luxury RO water purification systems, genuine spare parts, expert service and AMC support from VINI RO.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        <LoadingFeedback />
        <AuthStateProvider>
          <ShopStateProvider>
            {children}
            <BackToTopButton />
          </ShopStateProvider>
        </AuthStateProvider>
      </body>
    </html>
  );
}
