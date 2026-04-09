import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Layer, LayerType, BlendMode, TrackMatte, Transform } from "@/types/layer";
import { createAnimatedProperty } from "@/types/keyframe";
import { nanoid } from "nanoid";
import { useCompositionStore } from "./compositionStore";

interface LayerState {
    layers: Record<string, Layer>; // Store normalized by ID
}

interface LayerActions {
    addLayer: (compId: string, type: LayerType, name?: string, overrides?: Partial<Layer>) => string;
    removeLayer: (compId: string, id: string) => void;
    updateLayer: (id: string, patch: Partial<Layer>) => void;
    
    // Actions
    duplicateLayer: (compId: string, id: string) => string | null;
    splitLayer: (compId: string, id: string, splitTime: number) => string | null;
    
    // Quick toggles
    toggleLock: (id: string) => void;
    toggleVisibility: (id: string) => void;
    toggleShy: (id: string) => void;
    toggleSolo: (id: string, allLayerIds: string[]) => void;
    
    // Hierarchy
    setParent: (childId: string, parentId: string | null) => void;
    
    // Compositing
    setBlendMode: (id: string, blendMode: BlendMode) => void;
    setTrackMatte: (id: string, trackMatte: TrackMatte) => void;
}

// Ensure useCompositionStore is imported when actually using the actions
// to call _addLayerToComp and _removeLayerFromComp, but we do it via
// a helper or let the caller orchestrate it to avoid circular deps.
// For now, we'll assume the orchestration happens in a unified hook or caller side.

function createDefaultTransform(): Transform {
    return {
        position: createAnimatedProperty({ x: 960, y: 540 }),
        scale: createAnimatedProperty({ x: 100, y: 100 }),
        rotation: createAnimatedProperty(0),
        opacity: createAnimatedProperty(100),
        anchorPoint: createAnimatedProperty({ x: 0, y: 0 }),
        skew: createAnimatedProperty(0),
        skewAxis: createAnimatedProperty(0),
    };
}

export function createBaseLayer(type: LayerType, name: string): Layer {
    return {
        id: nanoid(),
        name,
        type,
        inPoint: 0,
        outPoint: 150, // default 5 seconds at 30fps
        startTime: 0,
        parentId: null,
        visible: true,
        locked: false,
        shy: false,
        solo: false,
        colorLabel: "#6366f1",
        blendMode: "normal",
        trackMatte: "none",
        transform: createDefaultTransform(),
        effects: [],
        masks: [],
        data: {},
    };
}

const initialState: LayerState = {
    layers: {},
};

export const useLayerStore = create<LayerState & LayerActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,
                
                addLayer: (compId, type, name = "New Layer", overrides = {}) => {
                    const newLayer = {
                        ...createBaseLayer(type, name),
                        ...overrides,
                    };
                    
                    set((s) => {
                        s.layers[newLayer.id] = newLayer;
                    });
                    
                    // NOTE: The caller MUST also call useCompositionStore.getState()._addLayerToComp(compId, newLayer.id)
                    return newLayer.id;
                },
                
                removeLayer: (compId, id) => {
                    set((s) => {
                        delete s.layers[id];
                    });
                    // NOTE: The caller MUST also call useCompositionStore.getState()._removeLayerFromComp(compId, id)
                },
                
                updateLayer: (id, patch) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) {
                        Object.assign(layer, patch);
                    }
                }),
                
                duplicateLayer: (compId, id) => {
                    const layer = get().layers[id];
                    if (!layer) return null;
                    
                    // Deep clone layer
                    const newLayer = JSON.parse(JSON.stringify(layer)) as Layer;
                    newLayer.id = nanoid();
                    newLayer.name = `${layer.name} Copy`;
                    
                    set((s) => {
                        s.layers[newLayer.id] = newLayer;
                    });
                    
                    useCompositionStore.getState()._insertLayerInComp(compId, newLayer.id, id);
                    return newLayer.id;
                },
                
                splitLayer: (compId, id, splitTime) => {
                    const layer = get().layers[id];
                    if (!layer || splitTime <= layer.inPoint || splitTime >= layer.outPoint) return null;
                    
                    const newId = get().duplicateLayer(compId, id);
                    if (!newId) return null;
                    
                    set((s) => {
                        s.layers[id].outPoint = splitTime;
                        s.layers[newId].inPoint = splitTime;
                        // For a clean split, standard behavior is to not append "Copy" if it's a split seg.
                        s.layers[newId].name = s.layers[id].name;
                    });
                    
                    return newId;
                },
                
                toggleLock: (id) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) layer.locked = !layer.locked;
                }),
                
                toggleVisibility: (id) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) layer.visible = !layer.visible;
                }),
                
                toggleShy: (id) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) layer.shy = !layer.shy;
                }),
                
                toggleSolo: (id, allLayerIds) => set((s) => {
                    const layer = s.layers[id];
                    if (!layer) return;
                    
                    const willSolo = !layer.solo;
                    layer.solo = willSolo;
                    
                    // If this is the ONLY soloed layer now, we might need complex state logic,
                    // but tracking the simple boolean per layer is enough for the store.
                    // The renderer handles "if any solo is true, hide non-soloed".
                }),
                
                setParent: (childId, parentId) => set((s) => {
                    const child = s.layers[childId];
                    if (child && childId !== parentId) { 
                        // simple circular check avoidance (not deep)
                        child.parentId = parentId;
                    }
                }),
                
                setBlendMode: (id, blendMode) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) layer.blendMode = blendMode;
                }),
                
                setTrackMatte: (id, trackMatte) => set((s) => {
                    const layer = s.layers[id];
                    if (layer) layer.trackMatte = trackMatte;
                })
            })),
            {
                name: "motionai-layers",
            }
        ),
        { name: "LayerStore" }
    )
);
