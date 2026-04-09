"use client";

import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/stores/timelineStore";
import { useCompositionStore } from "@/stores/compositionStore";

/**
 * Playback engine — drives currentTime forward when isPlaying is true.
 * Uses requestAnimationFrame for smooth, frame-accurate playback.
 * Mount this once at the root of the editor.
 */
export function usePlayback() {
    const rafId = useRef<number>(0);
    const lastTimestamp = useRef<number>(0);

    useEffect(() => {
        function tick(timestamp: number) {
            const { isPlaying, currentTime, duration, workAreaIn, workAreaOut, setCurrentTime } =
                useTimelineStore.getState();
            const activeComp = useCompositionStore.getState().compositions.find(
                (c) => c.id === useCompositionStore.getState().activeCompositionId
            );

            if (isPlaying) {
                const fps = activeComp?.fps || 30;
                const elapsed = timestamp - lastTimestamp.current;
                const frameDuration = 1000 / fps;

                if (elapsed >= frameDuration) {
                    const framesToAdvance = Math.floor(elapsed / frameDuration);
                    let nextTime = currentTime + framesToAdvance;

                    // Loop within work area
                    if (nextTime >= workAreaOut) {
                        nextTime = workAreaIn;
                    }

                    setCurrentTime(nextTime);
                    lastTimestamp.current = timestamp - (elapsed % frameDuration);
                }
            } else {
                lastTimestamp.current = timestamp;
            }

            rafId.current = requestAnimationFrame(tick);
        }

        rafId.current = requestAnimationFrame(tick);

        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);
}
