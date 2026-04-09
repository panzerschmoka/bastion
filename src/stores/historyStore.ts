import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useCompositionStore } from "./compositionStore";
import { useLayerStore } from "./layerStore";
import { useEffectsStore } from "./effectsStore";
import { useSelectionStore } from "./selectionStore";

// This is an advanced implementation of Undo/Redo that
// takes snapshots of all the relevant Zustand stores.
// It does NOT persist to localStorage directly to save space,
// as history can get massive.

interface Snapshot {
    compositions: any;
    layers: any;
    effects: any;
    selection: any;
}

interface HistoryState {
    undoStack: Snapshot[];
    redoStack: Snapshot[];
    maxHistory: number;
    isBatching: boolean;
}

interface HistoryActions {
    takeSnapshot: () => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;
    startBatch: () => void;
    endBatch: () => void;
}

const initialState: HistoryState = {
    undoStack: [],
    redoStack: [],
    maxHistory: 50,
    isBatching: false,
};

export const useHistoryStore = create<HistoryState & HistoryActions>()(
    devtools(
        (set, get) => ({
            ...initialState,
            
            takeSnapshot: () => {
                if (get().isBatching) return;
                
                const snap: Snapshot = {
                    compositions: useCompositionStore.getState().compositions,
                    layers: useLayerStore.getState().layers,
                    effects: useEffectsStore.getState().effects,
                    selection: {
                        layers: useSelectionStore.getState().selectedLayerIds,
                        keyframes: useSelectionStore.getState().selectedKeyframeIds,
                    }
                };
                
                set((state) => {
                    const newUndo = [...state.undoStack, snap];
                    if (newUndo.length > state.maxHistory) {
                        newUndo.shift(); // remove oldest
                    }
                    return {
                        undoStack: newUndo,
                        redoStack: [] // clear redo on new action
                    };
                });
            },
            
            undo: () => {
                if (get().undoStack.length === 0) return;
                
                set((state) => {
                    const currentSnap: Snapshot = {
                        compositions: useCompositionStore.getState().compositions,
                        layers: useLayerStore.getState().layers,
                        effects: useEffectsStore.getState().effects,
                        selection: {
                            layers: useSelectionStore.getState().selectedLayerIds,
                            keyframes: useSelectionStore.getState().selectedKeyframeIds,
                        }
                    };
                    
                    const newUndo = [...state.undoStack];
                    const targetSnap = newUndo.pop()!;
                    
                    // Apply target snap
                    useCompositionStore.setState({ compositions: targetSnap.compositions });
                    useLayerStore.setState({ layers: targetSnap.layers });
                    useEffectsStore.setState({ effects: targetSnap.effects });
                    useSelectionStore.setState({ 
                        selectedLayerIds: targetSnap.selection.layers,
                        selectedKeyframeIds: targetSnap.selection.keyframes
                    });
                    
                    return {
                        undoStack: newUndo,
                        redoStack: [...state.redoStack, currentSnap]
                    };
                });
            },
            
            redo: () => {
                if (get().redoStack.length === 0) return;
                
                set((state) => {
                    const currentSnap: Snapshot = {
                        compositions: useCompositionStore.getState().compositions,
                        layers: useLayerStore.getState().layers,
                        effects: useEffectsStore.getState().effects,
                        selection: {
                            layers: useSelectionStore.getState().selectedLayerIds,
                            keyframes: useSelectionStore.getState().selectedKeyframeIds,
                        }
                    };
                    
                    const newRedo = [...state.redoStack];
                    const targetSnap = newRedo.pop()!;
                    
                    // Apply target snap
                    useCompositionStore.setState({ compositions: targetSnap.compositions });
                    useLayerStore.setState({ layers: targetSnap.layers });
                    useEffectsStore.setState({ effects: targetSnap.effects });
                    useSelectionStore.setState({ 
                        selectedLayerIds: targetSnap.selection.layers,
                        selectedKeyframeIds: targetSnap.selection.keyframes
                    });
                    
                    return {
                        redoStack: newRedo,
                        undoStack: [...state.undoStack, currentSnap]
                    };
                });
            },
            
            clearHistory: () => set({ undoStack: [], redoStack: [] }),
            
            startBatch: () => set({ isBatching: true }),
            
            endBatch: () => {
                set({ isBatching: false });
                get().takeSnapshot(); // Take snapshot when batch ends
            }
        }),
        { name: "HistoryStore" }
    )
);
