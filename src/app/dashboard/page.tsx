"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { PromptInput } from "@/features/ai/components/PromptInput";
import { LoadingScreen } from "@/components/shared/LoadingSpinner";

interface Project {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
    thumbnail?: string | null;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchProjects();
        }
    }, [status]);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data.items || []);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = async () => {
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Новый проект" }),
            });
            const project = await res.json();
            router.push(`/editor/${project.id}`);
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("УДАЛИТЬ ПРОЕКТ?")) return;
        try {
            await fetch(`/api/projects/${id}`, { method: "DELETE" });
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    if (status === "loading") return <LoadingScreen />;

    return (
        <div className="min-h-screen flex flex-col bg-abyss">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-8 py-8 pt-20 space-y-12">
                {/* AI Prompt Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="line-red-thick w-8" />
                        <h2 className="font-display text-[28px] tracking-[0.2em] text-bone">
                            ГЕНЕРАЦИЯ
                        </h2>
                    </div>
                    <PromptInput />
                </section>

                {/* Разделитель */}
                <div className="divider-constructivist">
                    ────────────────────────────────────────────────────────────
                </div>

                {/* Projects */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="line-red-thick w-8" />
                        <h2 className="font-display text-[28px] tracking-[0.2em] text-bone">
                            ПРОЕКТЫ
                        </h2>
                    </div>
                    <ProjectList
                        projects={projects}
                        isLoading={isLoading}
                        onCreateNew={handleCreateNew}
                        onDelete={handleDelete}
                    />
                </section>
            </main>
        </div>
    );
}
