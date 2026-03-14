"use client";

import { useEditor } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { formatDuration } from "@/lib/utils";

// Мок Remotion Player (для Phase 8 просто базовый UI)
// В будущем интегрируем @remotion/player
export function VideoPlayer() {
    const { 
        currentFrame, 
        isPlaying, 
        setPlaying, 
        setCurrentFrame,
        activeScene
    } = useEditor();

    // Заглушка FPS (берем из проекта позже)
    const fps = 30;
    const durationInFrames = activeScene?.durationInFrames || 150;
    const durationInSeconds = durationInFrames / fps;
    const currentSecond = currentFrame / fps;

    const togglePlay = () => setPlaying(!isPlaying);

    const handleSliderChange = (value: number[]) => {
        setCurrentFrame(value[0]);
    };

    return (
        <div className="flex flex-col h-full bg-black/95 rounded-lg border overflow-hidden shadow-lg">
            {/* Player Viewport Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black/40">
                {/* Заглушка плеера */}
                <div 
                    className="relative w-full max-w-2xl aspect-video bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 overflow-hidden"
                    style={{ backgroundColor: activeScene?.backgroundColor || "#000" }}
                >
                    <span className="mb-2">MotionAI Player</span>
                    <span className="text-sm">Scene: {activeScene?.name || "Новый проект"}</span>
                    
                    {/* Рендер элементов сцены (заглушка) */}
                    {activeScene?.elements.map(el => (
                        <div 
                            key={el.id}
                            className="absolute border border-dashed border-primary/50 flex items-center justify-center"
                            style={{
                                left: `${(el.x / 1920) * 100}%`,
                                top: `${(el.y / 1080) * 100}%`,
                                width: `${(el.width / 1920) * 100}%`,
                                height: `${(el.height / 1080) * 100}%`,
                                opacity: el.opacity,
                                transform: `rotate(${el.rotation}deg)`,
                                zIndex: el.zIndex
                            }}
                        >
                            <span className="text-xs">{el.type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Controls */}
            <div className="h-16 bg-background border-t px-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentFrame(0)}>
                        <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentFrame(durationInFrames - 1)}>
                        <SkipForward className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="text-sm text-muted-foreground tabular-nums min-w-[100px] text-center">
                    {formatDuration(currentSecond)} / {formatDuration(durationInSeconds)}
                </div>

                <div className="flex-1 mx-4">
                    <Slider
                        value={[currentFrame]}
                        max={durationInFrames}
                        step={1}
                        onValueChange={handleSliderChange}
                    />
                </div>
            </div>
        </div>
    );
}
