"use client";

import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { useState } from "react";

interface Project {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
    thumbnail?: string | null;
}

interface ProjectListProps {
    projects: Project[];
    isLoading?: boolean;
    onCreateNew?: () => void;
    onDelete?: (id: string) => void;
}

export function ProjectList({ projects, isLoading, onCreateNew, onDelete }: ProjectListProps) {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Мои проекты</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {projects.length} {projects.length === 1 ? "проект" : "проектов"}
                    </p>
                </div>
                <Button onClick={onCreateNew} className="gap-2 bg-accent hover:bg-accent/90 text-white">
                    <Plus className="h-4 w-4" />
                    Новый проект
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск проектов..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center border rounded-md">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9 rounded-r-none"
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9 rounded-l-none"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-lg border overflow-hidden">
                            <Skeleton className="aspect-video" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    {search ? (
                        <p>Ничего не найдено по запросу «{search}»</p>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-lg">Пока нет проектов</p>
                            <p className="text-sm">Создайте свой первый проект с помощью AI</p>
                            <Button onClick={onCreateNew} variant="outline" className="gap-2 mt-4">
                                <Plus className="h-4 w-4" />
                                Создать проект
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={
                    viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "flex flex-col gap-3"
                }>
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
