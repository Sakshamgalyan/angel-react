import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capital Growth Labs - Financial Data Analysis Platform",
  description: "Analyze financial data with real-time insights and advanced technical indicators. Get comprehensive market analysis including technicals, fundamentals, news sentiment, and peer comparisons.",
  keywords: ["financial analysis", "stock market", "technical indicators", "fundamentals", "market data"],
  authors: [{ name: "Capital Growth Labs" }],
  openGraph: {
    title: "Capital Growth Labs - Financial Data Analysis Platform",
    description: "Analyze financial data with real-time insights and advanced technical indicators.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capital Growth Labs - Financial Data Analysis Platform",
    description: "Analyze financial data with real-time insights and advanced technical indicators.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
