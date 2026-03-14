import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileVideo, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <FileVideo className="h-6 w-6 text-accent" />
                        <span className="inline-block font-bold text-lg">MotionAI</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Войти</Link>
                        </Button>
                        <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                            <Link href="/register">Начать бесплатно</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
                <div className="relative">
                    {/* Glow */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-accent" />
                            Передовые AI технологии
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                            Создавайте видео
                            <span className="block bg-gradient-to-r from-amber-600 via-accent to-rose-400 bg-clip-text text-transparent">
                                силой AI
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Опишите видео текстом — MotionAI сгенерирует сцены, титры и анимации. 
                            Редактируйте результат в визуальном редакторе и экспортируйте в MP4.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white gap-2 h-12 px-8 text-base shadow-lg shadow-accent/25">
                                <Link href="/register">
                                    Попробовать бесплатно
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                                <Link href="/login">Войти в аккаунт</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="border-t bg-muted/30 py-20 px-4">
                <div className="container max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Почему MotionAI?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: "AI Генерация",
                                desc: "Опишите видео текстом — AI создаст структуру сцен, тексты и анимации за секунды"
                            },
                            {
                                icon: Zap,
                                title: "Мощный редактор",
                                desc: "Визуальный таймлайн, drag & drop элементов, управление свойствами в реальном времени"
                            },
                            {
                                icon: Shield,
                                title: "Экспорт в MP4",
                                desc: "Облачный рендеринг. Высокое качество видео без нагрузки на ваш компьютер"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="text-center space-y-3 p-6 rounded-xl border bg-background/50 hover:border-accent/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
                                    <feature.icon className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-4">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileVideo className="h-4 w-4" />
                        MotionAI © 2026
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Сделано с ❤️ командой MotionAI
                    </p>
                </div>
            </footer>
        </div>
    );
}
