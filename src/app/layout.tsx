import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/shared/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "MotionAI — Система генерации движения",
    description: "Создавайте профессиональный моушн-дизайн с помощью AI. Генерация анимаций, визуальный редактор, облачный рендеринг.",
    keywords: ["моушн-дизайн", "AI", "MotionAI", "анимация", "генерация", "видео"],
    openGraph: {
        title: "MotionAI",
        description: "AI-powered motion design platform.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className="dark" suppressHydrationWarning>
            <body className="min-h-screen bg-background text-foreground">
                <div className="texture-overlay" />
                <div className="halftone-bg fixed inset-0 pointer-events-none -z-10" />
                <SessionProvider>
                    <main className="relative z-0">
                        {children}
                    </main>
                    <Toaster />
                </SessionProvider>
            </body>
        </html>
    );
}
