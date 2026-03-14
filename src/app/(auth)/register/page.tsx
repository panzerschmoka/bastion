"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileVideo, Loader2, AlertCircle } from "lucide-react";

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
            setError("Пароль должен быть минимум 6 символов");
            return;
        }

        setIsLoading(true);

        try {
            // Регистрация
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Ошибка регистрации");
            }

            // Авто-вход после регистрации
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Аккаунт создан, но не удалось войти. Попробуйте вручную.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md relative">
                <CardHeader className="space-y-3 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 justify-center mb-2">
                        <FileVideo className="h-8 w-8 text-accent" />
                        <span className="text-xl font-bold">MotionAI</span>
                    </Link>
                    <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
                    <CardDescription>Заполните форму для регистрации</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Ваше имя"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Минимум 6 символов"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Регистрация...
                                </>
                            ) : (
                                "Зарегистрироваться"
                            )}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Уже есть аккаунт?{" "}
                            <Link href="/login" className="text-accent hover:underline font-medium">
                                Войти
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
