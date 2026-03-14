import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { SessionProvider } from "@/components/shared/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "MotionAI — AI видеоредактор",
    description: "Создавайте профессиональные видео с помощью AI. Генерация сцен, титров и анимаций одним промптом.",
    keywords: ["видеоредактор", "AI", "MotionAI", "видео", "анимация", "генерация"],
    openGraph: {
        title: "MotionAI — AI видеоредактор",
        description: "Создавайте профессиональные видео с помощью AI.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className="min-h-screen antialiased">
                <SessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
