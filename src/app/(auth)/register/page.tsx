"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("ПАРОЛЬ ДОЛЖЕН БЫТЬ МИНИМУМ 6 СИМВОЛОВ");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "ОШИБКА РЕГИСТРАЦИИ");
            }

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("АККАУНТ СОЗДАН. ВОЙДИТЕ ВРУЧНУЮ.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message.toUpperCase() : "ОШИБКА СИСТЕМЫ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-abyss relative">
            {/* Вертикальная линия */}
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-charcoal/30 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10">
                {/* Лого */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-3 h-3 bg-state-red" />
                        <span className="font-display text-2xl tracking-[0.4em] text-bone">
                            MOTIONAI
                        </span>
                    </Link>
                </div>

                {/* Заголовок */}
                <div className="mb-10">
                    <div className="line-red-thick w-16 mb-6" />
                    <h1 className="font-display text-[48px] tracking-[0.2em] text-bone leading-none">
                        РЕГИСТРАЦИЯ
                    </h1>
                    <p className="annotation mt-3">
                        СОЗДАЙТЕ АККАУНТ ДЛЯ ДОСТУПА К СИСТЕМЕ
                    </p>
                </div>

                {/* Ошибка */}
                {error && (
                    <div className="border border-state-red bg-state-red/10 p-4 mb-6">
                        <p className="font-mono text-[12px] text-state-red tracking-wider">
                            {error}
                        </p>
                    </div>
                )}

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="font-mono text-[11px] text-bone/40 uppercase tracking-[0.2em]">
                            ИМЯ
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            className="w-full bg-transparent border border-charcoal px-4 py-3 font-mono text-[14px] text-bone placeholder:text-bone/20 focus:border-state-red focus:outline-none transition-colors duration-150"
                            placeholder="Ваше имя"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-mono text-[11px] text-bone/40 uppercase tracking-[0.2em]">
                            EMAIL
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border border-charcoal px-4 py-3 font-mono text-[14px] text-bone placeholder:text-bone/20 focus:border-state-red focus:outline-none transition-colors duration-150"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-mono text-[11px] text-bone/40 uppercase tracking-[0.2em]">
                            ПАРОЛЬ
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-transparent border border-charcoal px-4 py-3 font-mono text-[14px] text-bone placeholder:text-bone/20 focus:border-state-red focus:outline-none transition-colors duration-150"
                            placeholder="Минимум 6 символов"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="propaganda"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                СОЗДАНИЕ...
                            </>
                        ) : (
                            "СОЗДАТЬ АККАУНТ"
                        )}
                    </Button>
                </form>

                {/* Нижняя ссылка */}
                <div className="mt-8 text-center">
                    <div className="line-red w-12 mx-auto mb-4" />
                    <p className="font-mono text-[12px] text-bone/30 tracking-wider">
                        УЖЕ ЕСТЬ АККАУНТ?{" "}
                        <Link
                            href="/login"
                            className="text-state-red hover:text-bone transition-colors duration-150"
                        >
                            ВОЙТИ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
