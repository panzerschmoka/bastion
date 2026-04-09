"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLANS = [
    {
        name: "FREE",
        displayName: "БЕСПЛАТНЫЙ",
        price: "$0",
        period: "НАВСЕГДА",
        features: [
            "3 ПРОЕКТА",
            "10 ГЕНЕРАЦИЙ / МЕСЯЦ",
            "720P ЭКСПОРТ",
            "БАЗОВЫЕ ШАБЛОНЫ",
        ],
        cta: "ТЕКУЩИЙ ПЛАН",
        featured: false,
    },
    {
        name: "PRO",
        displayName: "PRO",
        price: "$19",
        period: "/ МЕСЯЦ",
        features: [
            "∞ ПРОЕКТОВ",
            "100 ГЕНЕРАЦИЙ / МЕСЯЦ",
            "1080P ЭКСПОРТ",
            "ВСЕ ШАБЛОНЫ",
            "ПРИОРИТЕТНЫЙ РЕНДЕР",
        ],
        cta: "ВЫБРАТЬ PRO",
        featured: true,
    },
    {
        name: "BUSINESS",
        displayName: "BUSINESS",
        price: "$49",
        period: "/ МЕСЯЦ",
        features: [
            "∞ ПРОЕКТОВ",
            "∞ ГЕНЕРАЦИЙ",
            "4K ЭКСПОРТ",
            "ВСЕ ШАБЛОНЫ",
            "ПРИОРИТЕТНЫЙ РЕНДЕР",
            "API ДОСТУП",
            "ПОДДЕРЖКА 24/7",
        ],
        cta: "ВЫБРАТЬ BUSINESS",
        featured: false,
    },
];

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelectPlan = async (planName: string) => {
        if (planName === "FREE") return;

        if (!session) {
            router.push("/register");
            return;
        }

        setLoading(planName);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planName }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "ОШИБКА ОПЛАТЫ");
            }
        } catch {
            alert("ОШИБКА СОЕДИНЕНИЯ");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-abyss">
            {/* Навигация */}
            <header className="fixed top-0 z-40 w-full border-b border-charcoal bg-abyss">
                <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-state-red" />
                        <span className="font-display text-xl tracking-[0.4em] text-bone uppercase">
                            MotionAI
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-[12px] uppercase tracking-[0.3em] text-bone/50 hover:text-bone transition-colors duration-150"
                        >
                            ПРОЕКТЫ
                        </Link>
                    </div>
                </div>
            </header>

            {/* Контент */}
            <main className="pt-14">
                {/* Hero */}
                <section className="section-padding px-4 text-center">
                    <div className="container mx-auto max-w-5xl">
                        <p className="annotation mb-4">ТАРИФНЫЕ ПЛАНЫ</p>
                        <h1 className="font-display text-hero text-bone mb-6">
                            ВЫБЕРИТЕ
                            <br />
                            <span className="text-state-red">ПЛАН</span>
                        </h1>
                        <div className="mx-auto w-32">
                            <div className="line-red-thick" />
                        </div>
                    </div>
                </section>

                {/* Планы */}
                <section className="px-4 pb-section">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid md:grid-cols-3 gap-0">
                            {PLANS.map((plan, i) => (
                                <div
                                    key={plan.name}
                                    className={`
                                        border border-charcoal p-8 md:p-10 flex flex-col
                                        ${plan.featured ? "border-state-red bg-abyss-light relative" : ""}
                                    `}
                                >
                                    {/* Featured badge */}
                                    {plan.featured && (
                                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-state-red" />
                                    )}

                                    {/* Plan header */}
                                    <div className="mb-8">
                                        <span className="font-mono text-[11px] text-state-red tracking-[0.3em]">
                                            [{String(i + 1).padStart(2, "0")}]
                                        </span>
                                        <h3 className="font-display text-[36px] tracking-[0.2em] text-bone mt-2">
                                            {plan.displayName}
                                        </h3>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-8">
                                        <span className="font-display text-[64px] tracking-[0.1em] text-bone leading-none">
                                            {plan.price}
                                        </span>
                                        <span className="font-mono text-[12px] text-bone/40 tracking-wider ml-2">
                                            {plan.period}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="line-red mb-6" />

                                    {/* Features */}
                                    <ul className="flex-1 space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="font-mono text-[12px] text-bone/60 tracking-wider flex items-start gap-3"
                                            >
                                                <span className="text-state-red mt-0.5">■</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <button
                                        onClick={() => handleSelectPlan(plan.name)}
                                        disabled={plan.name === "FREE" || loading !== null}
                                        className={`
                                            w-full py-4 font-display text-[16px] tracking-[0.2em] uppercase
                                            border transition-all duration-150
                                            ${plan.name === "FREE"
                                                ? "border-charcoal text-bone/30 cursor-default"
                                                : plan.featured
                                                    ? "border-state-red bg-state-red text-bone hover:bg-transparent"
                                                    : "border-state-red text-bone hover:bg-state-red"
                                            }
                                            ${loading === plan.name ? "opacity-50" : ""}
                                        `}
                                    >
                                        {loading === plan.name ? "ОБРАБОТКА..." : plan.cta}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Конструктивистский разделитель */}
                        <div className="divider-constructivist mt-12 text-center">
                            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                        </div>

                        {/* FAQ-подсказка */}
                        <div className="text-center mt-12 space-y-4">
                            <p className="font-mono text-[13px] text-bone/40 tracking-wider">
                                ОПЛАТА ЧЕРЕЗ STRIPE. БЕЗОПАСНО. ОТМЕНА В ЛЮБОЙ МОМЕНТ.
                            </p>
                            <Link
                                href="/"
                                className="inline-block font-mono text-[12px] text-state-red tracking-wider hover:text-bone transition-colors duration-150"
                            >
                                ← НАЗАД НА ГЛАВНУЮ
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Футер */}
            <footer className="border-t border-charcoal py-8 px-4">
                <div className="container mx-auto max-w-5xl flex items-center justify-between">
                    <p className="font-mono text-[11px] text-bone/20 tracking-wider">
                        © 2026 MOTIONAI
                    </p>
                    <div className="line-red w-16" />
                </div>
            </footer>
        </div>
    );
}
