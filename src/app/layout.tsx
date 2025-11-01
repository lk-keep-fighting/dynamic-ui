import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Dynamic UI Demo",
  description: "通过 Schema + AI 自动生成中后台界面的 Next.js 演示项目",
};

const navLinks = [
  { href: "/", label: "概览" },
  { href: "/demo", label: "Schema Demo" },
  { href: "/chat", label: "AI 对话" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={cn(geistSans.variable, geistMono.variable, "bg-background text-foreground antialiased")}>
        <div className="min-h-screen">
          <header className="border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Dynamic UI Studio
              </Link>
              <nav className="flex items-center gap-5 text-sm text-muted-foreground">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">{children}</main>
        </div>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
