"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    // Не показываем навбар в редакторе
    if (pathname?.startsWith("/editor/")) {
        return null;
    }

    return (
        <header className="fixed top-0 z-40 w-full border-b border-charcoal bg-abyss">
            <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
                {/* Логотип — государственный шрифт */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Красная метка вместо иконки */}
                        <div className="w-3 h-3 bg-state-red" />
                        <span className="font-display text-xl tracking-[0.4em] text-bone uppercase">
                            MotionAI
                        </span>
                    </Link>

                    {isAuthenticated && (
                        <nav className="hidden md:flex gap-8">
                            <Link
                                href="/dashboard"
                                className="text-annotation uppercase tracking-decree text-bone/50 hover:text-state-red transition-colors duration-150"
                            >
                                ПРОЕКТЫ
                            </Link>
                        </nav>
                    )}
                </div>

                {/* Навигация справа */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/pricing"
                        className="text-annotation uppercase tracking-decree text-bone/50 hover:text-state-red transition-colors duration-150 mr-4"
                    >
                        ТАРИФЫ
                    </Link>
                    {!isLoading && (
                        isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">ВОЙТИ</Link>
                                </Button>
                                <Button variant="propaganda" size="sm" asChild>
                                    <Link href="/register">РЕГИСТРАЦИЯ</Link>
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
