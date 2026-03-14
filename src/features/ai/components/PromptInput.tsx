"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

export function PromptInput() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        setError(null);

        try {
            // 1. Создаём новый проект
            const projectRes = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: prompt.slice(0, 80) }),
            });

            if (!projectRes.ok) {
                throw new Error("Не удалось создать проект");
            }

            const project = await projectRes.json();

            // 2. Генерируем сцены через AI
            const genRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, projectId: project.id }),
            });

            if (!genRes.ok) {
                const data = await genRes.json();
                throw new Error(data.error || "Ошибка генерации");
            }

            const result = await genRes.json();
            console.log("AI scenes generated:", result);

            // 3. Переходим в редактор
            router.push(`/editor/${project.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-background border rounded-xl overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-accent/50">
            <div className="p-3">
                <Textarea 
                    placeholder="Опишите, какое видео вы хотите создать (например: 'Сделай 15-секундное видео про космос с неоновым текстом и плавным зумом...')"
                    className="min-h-[100px] border-0 focus-visible:ring-0 resize-none p-0 bg-transparent text-base"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleGenerate();
                        }
                    }}
                />
            </div>

            {error && (
                <div className="mx-3 mb-2 flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}
            
            <div className="bg-muted/30 p-3 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                    {isGenerating ? "AI генерирует сцены..." : "Ctrl+Enter для быстрой генерации"}
                </span>
                <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-accent hover:bg-accent/90 text-white gap-2 shadow-md shadow-accent/20 rounded-lg px-6"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Генерация...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Сгенерировать
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
