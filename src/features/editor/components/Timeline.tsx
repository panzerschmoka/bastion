"use client";

import { useEditor } from "@/hooks/useEditor";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Timeline() {
    const { scenes, activeSceneIndex, setActiveScene, currentFrame } = useEditor();

    return (
        <div className="h-64 flex flex-col bg-background border-t">
            <div className="h-10 border-b flex items-center px-4 justify-between bg-muted/20">
                <span className="text-sm font-medium">Таймлайн</span>
                <span className="text-xs text-muted-foreground">Кадр {currentFrame}</span>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Scene List (Tracks Info) */}
                <div className="w-48 border-r bg-muted/10 flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {scenes.map((scene, idx) => (
                                <button
                                    key={scene.id}
                                    onClick={() => setActiveScene(idx)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors truncate ${
                                        activeSceneIndex === idx 
                                        ? "bg-primary text-primary-foreground font-medium" 
                                        : "hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    {scene.name}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Tracks Area (Timeline Canvas) */}
                <div className="flex-1 relative overflow-hidden bg-zinc-950/50">
                    <ScrollArea className="w-full h-full">
                        <div className="min-w-full h-full relative" style={{ width: "200%" }}>
                            {/* Time Ruler */}
                            <div className="h-6 border-b border-zinc-800/50 flex sticky top-0 bg-background/90 z-10">
                                {/* Ruler markers */}
                            </div>
                            
                            {/* Element Tracks for Active Scene */}
                            <div className="p-2 space-y-2">
                                {scenes[activeSceneIndex]?.elements.map((el, i) => (
                                    <div key={el.id} className="h-8 bg-zinc-900 border border-zinc-800 rounded flex items-center relative overflow-hidden group">
                                        <div 
                                            className="absolute h-full bg-primary/40 group-hover:bg-primary/50 transition-colors border-x border-primary/50 cursor-ew-resize rounded-sm"
                                            style={{
                                                left: `${(el.from / scenes[activeSceneIndex].durationInFrames) * 100}%`,
                                                width: `${(el.durationInFrames / scenes[activeSceneIndex].durationInFrames) * 100}%`
                                            }}
                                        >
                                            <span className="text-[10px] pl-2 block truncate mt-1.5 opacity-80">{el.type}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!scenes[activeSceneIndex]?.elements || scenes[activeSceneIndex]?.elements.length === 0) && (
                                    <div className="h-full flex items-center justify-center text-sm text-zinc-600 italic">
                                        Нет элементов на сцене (нажмите + для добавления)
                                    </div>
                                )}
                            </div>

                            {/* Playhead Indicator */}
                            <div 
                                className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                                style={{
                                    left: `${(currentFrame / (scenes[activeSceneIndex]?.durationInFrames || 150)) * 100}%`
                                }}
                            >
                                <div className="absolute top-0 -translate-x-1/2 w-3 h-3 rotate-45 bg-red-500 rounded-sm" />
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
