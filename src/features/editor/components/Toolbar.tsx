"use client";

import { useEditor } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Type, Image as ImageIcon, Sparkles, LayoutTemplate, Undo2, Redo2, Copy, Trash2, MousePointer2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Toolbar() {
    const { 
        addText, 
        addImage, 
        addShape,
        deleteSelected,
        duplicateSelected,
        canUndo,
        canRedo,
        undo,
        redo,
        selectedElementId
    } = useEditor();

    const tools = [
        { icon: MousePointer2, label: "Выделение", action: () => {}, active: true },
        { icon: Type, label: "Добавить текст", action: addText },
        { icon: ImageIcon, label: "Добавить медиа", action: () => addImage("https://placehold.co/600x400/png") },
        { icon: LayoutTemplate, label: "Добавить фигуру", action: addShape },
    ];

    const aiTools = [
        { icon: Sparkles, label: "AI Генерация (Промпт)", action: () => alert("AI Генерация скоро будет доступна"), highlight: true },
    ];

    return (
        <TooltipProvider delayDuration={300}>
            <div className="w-16 h-full flex flex-col items-center py-4 bg-background border-r shrink-0 gap-4">
                
                {/* Main Tools */}
                <div className="flex flex-col gap-2 w-full px-2">
                    {tools.map((tool, idx) => (
                        <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant={tool.active ? "secondary" : "ghost"} 
                                    size="icon" 
                                    className={`w-full h-12 rounded-xl transition-all ${tool.active ? "bg-primary/10 text-primary" : ""}`}
                                    onClick={tool.action}
                                >
                                    <tool.icon className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{tool.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <Separator className="w-8" />

                {/* AI Tools */}
                <div className="flex flex-col gap-2 w-full px-2">
                    {aiTools.map((tool, idx) => (
                        <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="w-full h-12 rounded-xl border-primary/50 text-primary hover:bg-primary/10 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                    onClick={tool.action}
                                >
                                    <tool.icon className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{tool.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <Separator className="w-8" />

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full px-2 mt-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-full h-12"
                                disabled={!canUndo}
                                onClick={undo}
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Отменить (Ctrl+Z)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-full h-12"
                                disabled={!canRedo}
                                onClick={redo}
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Повторить (Ctrl+Y)</TooltipContent>
                    </Tooltip>

                    <Separator className="w-8 mx-auto my-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-full h-12"
                                disabled={!selectedElementId}
                                onClick={duplicateSelected}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Дублировать (Ctrl+D)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={!selectedElementId}
                                onClick={deleteSelected}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Удалить (Del)</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
