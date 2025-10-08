import type { Metadata } from "next";
import { Alegreya, Belleza } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const belleza = Belleza({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-headline",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Connect & Grow",
  description: "Building a stronger community, one visitor at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={cn(alegreya.variable, belleza.variable)}>
      <body className="font-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
