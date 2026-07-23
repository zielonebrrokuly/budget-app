import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { isAuthEnabled } from "@/lib/session";
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
  title: "Budżet",
  description: "Osobisty budżet domowy",
};

export const viewport: Viewport = {
  themeColor: "#0a0b10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col text-foreground bg-fixed bg-[linear-gradient(165deg,var(--background)_0%,var(--background-2)_55%,var(--background)_100%)]"
      >
        <Nav authEnabled={isAuthEnabled()} />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
