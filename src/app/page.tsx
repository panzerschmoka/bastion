"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════
   MOTIONAI — 1930s MODERNISM / ARCHIVAL
   ═══════════════════════════════════════════════════ */

const FEATURES = [
    {
        title: "AI ГЕНЕРАЦИЯ",
        desc: "Текстовый промпт — и система создаёт полноценную анимацию. Без навыков. Без компромиссов.",
    },
    {
        title: "ВИЗУАЛЬНЫЙ РЕДАКТОР",
        desc: "Таймлайн. Кейфреймы. Свойства. Полный контроль над каждым кадром.",
    },
    {
        title: "РЕНДЕРИНГ",
        desc: "Облачный экспорт в MP4. Высокое разрешение. Мгновенная выдача.",
    },
    {
        title: "МОНТАЖ",
        desc: "Слои, маски, эффекты, blend modes. Профессиональный пайплайн.",
    },
];

const STEPS = [
    {
        num: "01",
        title: "ОПИШИТЕ",
        desc: "Введите текстовый промпт. Опишите анимацию, которую хотите увидеть.",
    },
    {
        num: "02",
        title: "СГЕНЕРИРУЙТЕ",
        desc: "AI анализирует запрос и создаёт полную структуру сцен и анимаций.",
    },
    {
        num: "03",
        title: "РЕДАКТИРУЙТЕ",
        desc: "Настройте результат в визуальном редакторе. Правьте каждый кейфрейм.",
    },
    {
        num: "04",
        title: "ЭКСПОРТИРУЙТЕ",
        desc: "Облачный рендер в MP4. Скачайте или поделитесь ссылкой.",
    },
];

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function HomePage() {
    const shouldReduceMotion = useReducedMotion();

    const heroVariants = {
        hidden: { clipPath: "inset(100% 0 0 0)" },
        visible: { clipPath: "inset(0 0 0 0)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative selection:bg-accent selection:text-paper">
            
            {/* GRID OVERLAY FOR 1930s TECHNICAL/ARCHIVE FEEL */}
            <div className="grid-overlay fixed inset-0 opacity-[0.4] pointer-events-none -z-10" />

            {/* FLOATING ANTIGRAVITY ELEMENTS (DECORATIVE) */}
            <div className="absolute top-1/4 left-10 w-4 h-4 border border-line animate-float pointer-events-none hidden md:block" />
            <div className="absolute top-[60%] right-20 w-[1px] h-32 bg-line animate-float pointer-events-none hidden md:block" style={{ animationDelay: '2s' }} />

            {/* НАВИГАЦИЯ */}
            <header className="fixed top-0 z-40 w-full border-b border-line bg-background/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between mx-auto px-6 md:px-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-3 h-3 bg-paper border border-line group-hover:bg-accent transition-colors" />
                        <span className="font-display text-xl tracking-[0.08em] text-foreground uppercase">
                            MotionAI
                        </span>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/pricing" className="archive-tag hover:text-foreground transition-colors">
                            ТАРИФЫ
                        </Link>
                        <Link href="/login" className="archive-tag hover:text-foreground transition-colors">
                            ВОЙТИ
                        </Link>
                        <Link
                            href="/register"
                            className="font-display text-sm uppercase tracking-widest text-background bg-foreground px-6 py-2 hover:bg-accent transition-colors"
                        >
                            НАЧАТЬ
                        </Link>
                    </div>
                </div>
            </header>

            {/* СЕКЦИЯ 1: HERO */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16 relative">
                {/* Фоновая вертикальная линия */}
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-line -translate-x-1/2" />
                
                <motion.div 
                    initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                    }}
                    className="relative z-10 max-w-5xl space-y-10"
                >
                    {/* Архивная метка */}
                    <motion.div variants={staggerItem} className="flex justify-center items-center gap-4">
                        <span className="w-8 h-[1px] bg-steel/50" />
                        <p className="archive-tag">ID: 1930 / INDEX-001</p>
                        <span className="w-8 h-[1px] bg-steel/50" />
                    </motion.div>
                    
                    {/* Монументальный заголовок */}
                    <motion.h1 
                        variants={shouldReduceMotion ? staggerItem : heroVariants}
                        className="font-display text-hero text-foreground leading-[0.9] uppercase"
                    >
                        СОЗДАВАЙ
                        <br />
                        <span className="text-accent underline decoration-1 underline-offset-8">ДВИЖЕНИЕ</span>
                    </motion.h1>

                    {/* Разделитель */}
                    <motion.div variants={staggerItem} className="mx-auto w-16">
                        <div className="line-divider bg-accent h-[2px]" />
                    </motion.div>

                    {/* Подзаголовок */}
                    <motion.p variants={staggerItem} className="font-sans text-[15px] text-steel max-w-xl mx-auto leading-relaxed">
                        Опишите видео текстом. AI создаст анимацию.
                        <br />
                        Редактируйте. Экспортируйте. Владейте.
                    </motion.p>

                    {/* CTA */}
                    <motion.div variants={staggerItem} className="pt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center border border-accent bg-transparent text-accent font-display text-lg tracking-[0.1em] uppercase px-12 py-4 hover:bg-accent hover:text-paper transition-colors"
                        >
                            НАЧАТЬ РАБОТУ
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Архивный декоративный блок в углу */}
                <div className="absolute bottom-12 left-12 archive-tag text-left hidden lg:block">
                    FORM 01-A<br/>
                    GENERATIVE DESIGN
                </div>

                <div className="absolute bottom-12 right-12 flex gap-1 pointer-events-none hidden lg:flex">
                    {[1,2,3].map(i => <div key={i} className="w-[1px] h-8 bg-steel/30" />)}
                </div>
            </section>

            {/* СЕКЦИЯ 2: О СЕРВИСЕ */}
            <section className="py-[clamp(80px,12vh,160px)] px-6 border-t border-line">
                <div className="container mx-auto max-w-5xl">
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}
                        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                        className="grid md:grid-cols-12 gap-8 md:gap-16 relative"
                    >
                        <motion.div variants={staggerItem} className="md:col-span-5">
                            <h2 className="font-display text-h2 text-foreground uppercase">
                                ПРОФЕССИОНАЛЬНАЯ
                                <br />
                                ПЛАТФОРМА
                            </h2>
                            <div className="mt-8 border-l border-line pl-6">
                                <p className="archive-tag">SYSTEM_CORE: ONLINE</p>
                            </div>
                        </motion.div>

                        <div className="md:col-span-1 hidden md:flex justify-center">
                            <div className="line-vertical" />
                        </div>

                        <motion.div variants={staggerItem} className="md:col-span-6 space-y-6">
                            <p className="font-sans text-[15px] text-steel leading-[1.8]">
                                MotionAI — единая система для создания профессионального
                                моушн-дизайна. Искусственный интеллект генерирует анимации
                                на уровне After Effects по текстовому описанию.
                            </p>
                            <p className="font-sans text-[15px] text-steel leading-[1.8]">
                                Визуальный редактор даёт полный контроль: таймлайн с
                                кейфреймами, свойства каждого элемента, слои и эффекты.
                                Результат — экспорт в MP4 через облачный рендеринг.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* СЕКЦИЯ 3: ВОЗМОЖНОСТИ (СВЕТЛАЯ) */}
            <section className="light-section py-[clamp(80px,12vh,160px)] px-6 border-t-[3px] border-accent">
                <div className="container mx-auto max-w-5xl">
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerItem}
                        className="text-center mb-16"
                    >
                        <p className="archive-tag text-ink/70 mb-4">ФУНКЦИОНАЛ</p>
                        <h2 className="font-display text-h2 text-ink">ВОЗМОЖНОСТИ</h2>
                    </motion.div>

                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="grid md:grid-cols-2 gap-0 border border-line"
                    >
                        {FEATURES.map((f, i) => (
                            <motion.div
                                variants={staggerItem}
                                key={i}
                                className="group border border-line p-10 hover:bg-ink/[0.02] transition-colors relative"
                            >
                                <span className="absolute top-10 right-10 font-mono text-[11px] text-accent">
                                    /// 0{i + 1}
                                </span>
                                <h3 className="font-display text-h3 text-ink mb-4">{f.title}</h3>
                                <p className="font-sans text-[14px] text-ink/70 leading-[1.8] max-w-sm">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* СЕКЦИЯ 4: ПРЕВЬЮ */}
            <section className="py-[clamp(80px,12vh,160px)] px-6 border-t border-line">
                <div className="container mx-auto max-w-5xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerItem}>
                        <p className="archive-tag mb-4">РЕЗУЛЬТАТЫ // VISUAL DATA</p>
                        <h2 className="font-display text-h2 text-foreground mb-12">БЕЗ СЛОВ</h2>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                        className="w-full aspect-video bg-ink border border-line relative overflow-hidden group flex items-center justify-center cursor-pointer"
                    >
                        <div className="absolute inset-x-0 inset-y-1/2 border-t border-line/50" />
                        <div className="absolute inset-y-0 inset-x-1/2 border-l border-line/50" />
                        
                        <div className="relative z-10 w-16 h-16 bg-background border border-line flex items-center justify-center group-hover:border-accent transition-colors shadow-[0_0_0_4px_rgba(243,235,221,0.05)]">
                            <div className="w-0 h-0 border-l-[10px] border-l-foreground border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1 group-hover:border-l-accent transition-colors" />
                        </div>
                        <div className="absolute bottom-6 right-6 archive-tag">MAIN_DEMO.MP4</div>
                    </motion.div>

                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="grid grid-cols-3 mt-4 gap-4"
                    >
                        {[1, 2, 3].map((n) => (
                            <motion.div variants={staggerItem} key={n} className="aspect-video bg-ink border border-line flex items-center justify-center hover:border-accent/40 transition-colors">
                                <span className="archive-tag text-steel/50">ARCHIVE_0{n}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* СЕКЦИЯ 5: ПРОЦЕСС */}
            <section className="py-[clamp(80px,12vh,160px)] px-6 border-t border-line">
                <div className="container mx-auto max-w-5xl relative">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerItem} className="mb-16">
                        <p className="archive-tag mb-4">ПРОЦЕСС</p>
                        <h2 className="font-display text-h2 text-foreground">
                            СИСТЕМНЫЙ
                            <br />
                            ПОДХОД
                        </h2>
                    </motion.div>

                    <div className="space-y-0 relative z-10">
                        {STEPS.map((step, i) => (
                            <motion.div
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={staggerItem}
                                key={i}
                                className="grid md:grid-cols-12 gap-6 md:gap-8 border-t border-line py-10 hover:bg-line/5 transition-colors group"
                            >
                                <div className="md:col-span-2">
                                    <span className="font-display text-5xl text-steel/20 group-hover:text-accent transition-colors leading-none">
                                        {step.num}
                                    </span>
                                </div>
                                <div className="md:col-span-4 flex items-center">
                                    <h3 className="font-display text-2xl text-foreground uppercase tracking-wide">
                                        {step.title}
                                    </h3>
                                </div>
                                <div className="md:col-span-6 flex items-center">
                                    <p className="font-sans text-[14px] text-steel leading-[1.8]">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                        <div className="border-t border-line" />
                    </div>
                </div>
            </section>

            {/* СЕКЦИЯ 6: CTA */}
            <section className="light-section py-[clamp(80px,12vh,160px)] px-6 border-t border-line relative overflow-hidden">
                <div className="absolute inset-0 halftone-bg" />
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerItem} className="space-y-12">
                        <h2 className="font-display text-[clamp(48px,8vw,80px)] text-ink leading-none uppercase">
                            АРХИВ ОТКРЫТ.
                            <br />
                            НАЧНИТЕ СЕЙЧАС.
                        </h2>
                        <p className="archive-tag text-ink/70">
                            БЕСПЛАТНЫЙ ДОСТУП. БЕЗ ОГРАНИЧЕНИЙ.
                        </p>
                        <div>
                            <Link
                                href="/register"
                                className="inline-block bg-accent text-paper font-display text-xl tracking-[0.1em] px-12 py-5 uppercase hover:bg-ink hover:text-paper transition-colors"
                            >
                                РЕГИСТРАЦИЯ
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ФУТЕР */}
            <footer className="border-t border-line py-12 px-6 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-2 space-y-4">
                            <span className="font-display text-2xl tracking-[0.05em] text-foreground uppercase">
                                MOTIONAI
                            </span>
                            <p className="font-sans text-[12px] text-steel leading-relaxed max-w-xs">
                                GENERATIVE ARCHIVE. СИСТЕМА ГЕНЕРАЦИИ МОУШН-ДИЗАЙНА ПО ТЕКСТОВЫМ ДАННЫМ.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="archive-tag">НАВИГАЦИЯ</p>
                            {["ВХОД", "РЕГИСТРАЦИЯ", "ПРОЕКТЫ"].map((l, i) => (
                                <Link key={i} href={l === "ВХОД"? "/login" : (l === "РЕГИСТРАЦИЯ" ? "/register" : "/dashboard")} className="block font-sans text-[13px] text-steel hover:text-foreground hover:underline underline-offset-4 decoration-line transition-all">
                                    {l}
                                </Link>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <p className="archive-tag">МЕТАДАННЫЕ</p>
                            <p className="font-sans text-[13px] text-steel">FORM.09-X</p>
                            <p className="font-sans text-[13px] text-steel">BUILD: 2026</p>
                        </div>
                    </div>
                    
                    <div className="h-[1px] bg-line my-8" />
                    
                    <div className="flex justify-between items-center text-[10px] text-steel/50 font-sans tracking-widest uppercase">
                        <p>© 2026 MOTIONAI</p>
                        <p>END OF FILE</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
