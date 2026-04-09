import { useEffect, useState } from "react";
import { useCompositionStore } from "../stores/compositionStore";
import { useLayerStore } from "../stores/layerStore";

// Helper to get active comp and its layers Reactively
export function useActiveComposition() {
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const comp = useCompositionStore(s => s.compositions.find(c => c.id === activeCompId));
    
    // Derived state for layers mapped to array
    const layerIndices = comp?.layers || [];
    // We must subscribe to the specific layers to cause re-renders when they change
    const layersMap = useLayerStore(s => s.layers);
    
    // Note: in a real big app, pulling all layers mapped like this can cause heavy re-renders.
    // For now, it's fine for bootstrapping.
    const layers = layerIndices.map(id => layersMap[id]).filter(Boolean);
    
    return {
        activeComp: comp || null,
        layers,
    };
}
