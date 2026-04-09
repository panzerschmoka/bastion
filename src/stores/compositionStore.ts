import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Composition, CompositionSettings, COMPOSITION_PRESETS } from "@/types/composition";
import { nanoid } from "nanoid";

interface CompositionState {
    projectId: string | null;
    compositions: Composition[];
    activeCompositionId: string | null;
}

interface CompositionActions {
    setProjectId: (id: string | null) => void;
    addComposition: (comp: Omit<Composition, 'id' | 'layers'>) => string;
    removeComposition: (id: string) => void;
    duplicateComposition: (id: string) => string | null;
    setActiveComposition: (id: string | null) => void;
    updateCompositionSettings: (id: string, settings: Partial<CompositionSettings>) => void;
    
    // Internal actions for layerStore to link layers to comps
    _addLayerToComp: (compId: string, layerId: string) => void;
    _insertLayerInComp: (compId: string, layerId: string, afterLayerId: string) => void;
    _removeLayerFromComp: (compId: string, layerId: string) => void;
    _reorderLayer: (compId: string, draggedId: string, dropTargetId: string) => void;
    
    reset: () => void;
}

const initialState: CompositionState = {
    projectId: null,
    compositions: [],
    activeCompositionId: null,
};

function createDefaultComp(): Composition {
    return {
        id: nanoid(),
        ...COMPOSITION_PRESETS.YOUTUBE_1080,
        durationInFrames: 300, // 10 seconds at 30fps
        backgroundColor: "#000000",
        name: "Main Composition",
        layers: [],
    };
}

export const useCompositionStore = create<CompositionState & CompositionActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,
                
                // Set default initial state on load if empty
                compositions: [createDefaultComp()],
                activeCompositionId: null, // will be set later if needed
                
                setProjectId: (id) => set((s) => { s.projectId = id; }),
                
                addComposition: (comp) => {
                    const id = nanoid();
                    set((s) => {
                        s.compositions.push({ ...comp, id, layers: [] });
                        s.activeCompositionId = id;
                    });
                    return id;
                },
                
                removeComposition: (id) => set((s) => {
                    s.compositions = s.compositions.filter(c => c.id !== id);
                    if (s.activeCompositionId === id) {
                        s.activeCompositionId = s.compositions[0]?.id || null;
                    }
                }),
                
                duplicateComposition: (id) => {
                    const comp = get().compositions.find(c => c.id === id);
                    if (!comp) return null;
                    
                    const newId = nanoid();
                    set((s) => {
                        // Deep clone, but layers are just IDs, so it's a shallow clone of the IDs array.
                        // Ideally, we'd need to duplicate actual layers via layerStore too! (Complex operation)
                        s.compositions.push({
                            ...comp,
                            id: newId,
                            name: `${comp.name} Copy`,
                            layers: [...comp.layers], // this is tricky, might need special handling
                        });
                        s.activeCompositionId = newId;
                    });
                    return newId;
                },
                
                setActiveComposition: (id) => set((s) => { s.activeCompositionId = id; }),
                
                updateCompositionSettings: (id, settings) => set((s) => {
                    const comp = s.compositions.find(c => c.id === id);
                    if (comp) {
                        Object.assign(comp, settings);
                    }
                }),
                
                _addLayerToComp: (compId, layerId) => set((s) => {
                    const comp = s.compositions.find(c => c.id === compId);
                    if (comp && !comp.layers.includes(layerId)) {
                        comp.layers.push(layerId);
                    }
                }),
                
                _insertLayerInComp: (compId, layerId, afterLayerId) => set((s) => {
                    const comp = s.compositions.find(c => c.id === compId);
                    if (comp && !comp.layers.includes(layerId)) {
                        const idx = comp.layers.indexOf(afterLayerId);
                        if (idx !== -1) {
                            comp.layers.splice(idx + 1, 0, layerId);
                        } else {
                            comp.layers.push(layerId);
                        }
                    }
                }),
                
                _reorderLayer: (compId, draggedId, targetId) => set((s) => {
                    const comp = s.compositions.find(c => c.id === compId);
                    if (!comp) return;
                    
                    const fromIdx = comp.layers.indexOf(draggedId);
                    const toIdx = comp.layers.indexOf(targetId);
                    
                    if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
                        const [draggedLayer] = comp.layers.splice(fromIdx, 1);
                        comp.layers.splice(toIdx, 0, draggedLayer);
                    }
                }),
                
                _removeLayerFromComp: (compId, layerId) => set((s) => {
                    const comp = s.compositions.find(c => c.id === compId);
                    if (comp) {
                        comp.layers = comp.layers.filter(id => id !== layerId);
                    }
                }),
                
                reset: () => set(() => {
                    const def = createDefaultComp();
                    return {
                        ...initialState,
                        compositions: [def],
                        activeCompositionId: def.id,
                    };
                }),
            })),
            {
                name: "motionai-compositions",
                partialize: (state) => ({
                    projectId: state.projectId,
                    compositions: state.compositions,
                    activeCompositionId: state.activeCompositionId,
                }),
            }
        ),
        { name: "CompositionStore" }
    )
);
