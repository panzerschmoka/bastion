"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ArrowLeft, Save, Download, Settings } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";

export function EditorHeader() {
    const { activeScene } = useEditor();
    
    return (
        <header className="h-14 bg-background border-b flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">Новый проект</span>
                    <span className="text-xs text-muted-foreground">{activeScene?.name || "Сцена"}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <div className="h-4 w-px bg-border mx-2" />
                
                <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden md:inline">Настройки</span>
                </Button>
                
                <Button variant="outline" size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    <span className="hidden md:inline">Сохранить</span>
                </Button>
                
                <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white">
                    <Download className="h-4 w-4" />
                    <span>Экспорт</span>
                </Button>
            </div>
        </header>
    );
}
