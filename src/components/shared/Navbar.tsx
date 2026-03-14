"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileVideo } from "lucide-react";

export function Navbar() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    // Не показываем навбар в самом редакторе (там свой тулбар)
    if (pathname?.startsWith("/editor/")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <FileVideo className="h-6 w-6 text-primary" />
                        <span className="inline-block font-bold">MotionAI</span>
                    </Link>
                    {isAuthenticated && (
                        <nav className="hidden gap-6 md:flex">
                            <Link
                                href="/dashboard"
                                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Проекты
                            </Link>
                        </nav>
                    )}
                </div>
                
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    {!isLoading && (
                        isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Войти</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Регистрация</Link>
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
