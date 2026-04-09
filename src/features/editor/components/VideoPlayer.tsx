"use client";

import { useTimelineStore } from "@/stores/timelineStore";
import { useCompositionStore } from "@/stores/compositionStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Preview player — thin wrapper around Canvas + timeline controls.
// In a future phase this will embed @remotion/player for full render preview.
export function VideoPlayer() {
    const currentTime = useTimelineStore(s => s.currentTime);
    const isPlaying = useTimelineStore(s => s.isPlaying);
    const duration = useTimelineStore(s => s.duration);
    const setCurrentTime = useTimelineStore(s => s.setCurrentTime);
    const setPlaying = useTimelineStore(s => s.setPlaying);

    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const activeComp = useCompositionStore(s =>
        s.compositions.find(c => c.id === s.activeCompositionId)
    );

    const fps = activeComp?.fps || 30;
    const durationInFrames = activeComp?.durationInFrames || duration;
    const durationInSeconds = durationInFrames / fps;
    const currentSecond = currentTime / fps;

    return (
        <div className="flex flex-col h-full bg-black/95 rounded-lg border overflow-hidden shadow-lg">
            {/* Player Viewport Placeholder */}
            <div className="flex-1 relative flex items-center justify-center bg-black/40">
                <div
                    className="relative w-full max-w-2xl aspect-video bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-500 overflow-hidden"
                    style={{ backgroundColor: activeComp?.backgroundColor || "#000" }}
                >
                    <span className="mb-2 text-sm">MotionAI Preview</span>
                    <span className="text-xs text-zinc-600">
                        {activeComp?.name || "No composition"} — {activeComp?.width}×{activeComp?.height} @ {fps}fps
                    </span>
                </div>
            </div>

            {/* Player Controls */}
            <div className="h-16 bg-background border-t px-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentTime(0)}>
                        <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={() => setPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentTime(durationInFrames - 1)}>
                        <SkipForward className="h-4 w-4" />
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground tabular-nums min-w-[100px] text-center">
                    {formatDuration(currentSecond)} / {formatDuration(durationInSeconds)}
                </div>

                <div className="flex-1 mx-4">
                    <Slider
                        value={[currentTime]}
                        max={durationInFrames}
                        step={1}
                        onValueChange={(val) => setCurrentTime(val[0])}
                    />
                </div>
            </div>
        </div>
    );
}
