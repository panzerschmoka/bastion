import { useEffect } from "react";
import { useHistoryStore } from "../stores/historyStore";
import { useTimelineStore } from "../stores/timelineStore";
import { useSelectionStore } from "../stores/selectionStore";
import { useLayerStore } from "../stores/layerStore";
import { useCompositionStore } from "../stores/compositionStore";
import { useKeyframeStore } from "../stores/keyframeStore";

export function useKeyboardShortcuts() {
    const undo = useHistoryStore(s => s.undo);
    const redo = useHistoryStore(s => s.redo);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input / textarea
            const tag = (document.activeElement as HTMLElement)?.tagName;
            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) return;

            const ctrl = e.ctrlKey || e.metaKey;

            // ─── Undo / Redo ───────────────────────────────────────
            if (ctrl && !e.shiftKey && e.key === "z") {
                e.preventDefault();
                undo();
                return;
            }
            if ((ctrl && e.shiftKey && e.key.toLowerCase() === "z") || (ctrl && e.key === "y")) {
                e.preventDefault();
                redo();
                return;
            }

            // ─── Play / Pause ──────────────────────────────────────
            if (e.code === "Space") {
                e.preventDefault();
                useTimelineStore.setState(s => ({ isPlaying: !s.isPlaying }));
                return;
            }

            // ─── Timeline navigation ───────────────────────────────
            if (e.key === "Home") {
                e.preventDefault();
                useTimelineStore.getState().setCurrentTime(0);
                return;
            }
            if (e.key === "End") {
                e.preventDefault();
                useTimelineStore.getState().setCurrentTime(useTimelineStore.getState().duration);
                return;
            }
            // Step 1 frame (←/→), 10 frames with Shift
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                const t = useTimelineStore.getState();
                t.setCurrentTime(Math.max(0, t.currentTime - step));
                return;
            }
            if (e.key === "ArrowRight") {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                const t = useTimelineStore.getState();
                t.setCurrentTime(Math.min(t.duration, t.currentTime + step));
                return;
            }

            // ─── Layer actions ─────────────────────────────────────
            const activeCompId = useCompositionStore.getState().activeCompositionId;
            if (!activeCompId) return;

            // Delete / Backspace — remove selected keyframes first, then layers
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                
                // If keyframes are selected, delete them instead of layers
                const selectedKfIds = useSelectionStore.getState().selectedKeyframeIds;
                if (selectedKfIds.length > 0) {
                    const selLayerIds = useSelectionStore.getState().selectedLayerIds;
                    if (selLayerIds.length === 1) {
                        const layerId = selLayerIds[0];
                        const layer = useLayerStore.getState().layers[layerId];
                        if (layer) {
                            const PROPS = ['position', 'scale', 'rotation', 'opacity', 'anchorPoint'];
                            for (const p of PROPS) {
                                const animProp = (layer.transform as any)[p];
                                if (animProp?.isAnimated && animProp.keyframes) {
                                    for (const kf of animProp.keyframes) {
                                        if (selectedKfIds.includes(kf.id)) {
                                            useKeyframeStore.getState().removeKeyframe(layerId, `transform.${p}`, kf.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    useSelectionStore.getState().selectKeyframe(null);
                    return;
                }
                
                const ids = useSelectionStore.getState().selectedLayerIds;
                for (const id of ids) {
                    useLayerStore.getState().removeLayer(activeCompId, id);
                    useCompositionStore.getState()._removeLayerFromComp(activeCompId, id);
                }
                useSelectionStore.getState().selectLayer(null);
                return;
            }

            // Ctrl+D — duplicate selected layers
            if (ctrl && e.key === "d") {
                e.preventDefault();
                const ids = useSelectionStore.getState().selectedLayerIds;
                for (const id of ids) {
                    const newId = useLayerStore.getState().duplicateLayer(activeCompId, id);
                    if (newId) {
                        useCompositionStore.getState()._addLayerToComp(activeCompId, newId);
                        useSelectionStore.getState().selectLayer(newId);
                    }
                }
                return;
            }

            // Ctrl+A — select all layers
            if (ctrl && e.key === "a") {
                e.preventDefault();
                const comp = useCompositionStore.getState().compositions.find(c => c.id === activeCompId);
                if (comp) {
                    for (let i = 0; i < comp.layers.length; i++) {
                        useSelectionStore.getState().selectLayer(comp.layers[i], i > 0);
                    }
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);
}
