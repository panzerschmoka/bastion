import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SelectionState {
    selectedLayerIds: string[];
    selectedKeyframeIds: string[];
    selectedPropertyPaths: string[]; // e.g. "transform.position"
}

interface SelectionActions {
    selectLayer: (id: string | null, multi?: boolean) => void;
    selectKeyframe: (id: string | null, multi?: boolean) => void;
    selectProperty: (path: string | null, multi?: boolean) => void;
    clearSelection: () => void;
}

const initialState: SelectionState = {
    selectedLayerIds: [],
    selectedKeyframeIds: [],
    selectedPropertyPaths: [],
};

export const useSelectionStore = create<SelectionState & SelectionActions>()(
    devtools(
        persist(
            immer((set) => ({
                ...initialState,
                
                selectLayer: (id, multi = false) => set((s) => {
                    // Clear other selections when selecting a layer
                    s.selectedKeyframeIds = [];
                    s.selectedPropertyPaths = [];
                    
                    if (!id) {
                        if (!multi) s.selectedLayerIds = [];
                        return;
                    }
                    
                    if (multi) {
                        const idx = s.selectedLayerIds.indexOf(id);
                        if (idx >= 0) s.selectedLayerIds.splice(idx, 1);
                        else s.selectedLayerIds.push(id);
                    } else {
                        s.selectedLayerIds = [id];
                    }
                }),
                
                selectKeyframe: (id, multi = false) => set((s) => {
                    if (!id) {
                        if (!multi) s.selectedKeyframeIds = [];
                        return;
                    }
                    
                    if (multi) {
                        const idx = s.selectedKeyframeIds.indexOf(id);
                        if (idx >= 0) s.selectedKeyframeIds.splice(idx, 1);
                        else s.selectedKeyframeIds.push(id);
                    } else {
                        s.selectedKeyframeIds = [id];
                    }
                }),
                
                selectProperty: (path, multi = false) => set((s) => {
                    if (!path) {
                        if (!multi) s.selectedPropertyPaths = [];
                        return;
                    }
                    
                    if (multi) {
                        const idx = s.selectedPropertyPaths.indexOf(path);
                        if (idx >= 0) s.selectedPropertyPaths.splice(idx, 1);
                        else s.selectedPropertyPaths.push(path);
                    } else {
                        s.selectedPropertyPaths = [path];
                    }
                }),
                
                clearSelection: () => set((s) => {
                    s.selectedLayerIds = [];
                    s.selectedKeyframeIds = [];
                    s.selectedPropertyPaths = [];
                })
            })),
            { name: "motionai-selection" }
        ),
        { name: "SelectionStore" }
    )
);
