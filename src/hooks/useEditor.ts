// Legacy useEditor hook — DEPRECATED
// All new editor components use the modular stores directly:
//   - useCompositionStore
//   - useLayerStore
//   - useTimelineStore
//   - useSelectionStore
//   - useKeyframeStore
//   - useEffectsStore
//   - useHistoryStore
//
// This file is kept as a stub to prevent import errors from legacy components.

export function useEditor() {
    console.warn("[DEPRECATED] useEditor() is deprecated. Use modular stores directly.");
    return {
        projectId: null,
        scenes: [],
        activeSceneIndex: 0,
        activeScene: null,
        selectedElementId: null,
        selectedElement: null,
        currentFrame: 0,
        isPlaying: false,
        zoom: 1,
        canUndo: false,
        canRedo: false,
        setProjectId: () => {},
        addScene: () => {},
        removeScene: () => {},
        setActiveScene: () => {},
        updateScene: () => {},
        reorderScenes: () => {},
        selectElement: () => {},
        setCurrentFrame: () => {},
        setPlaying: () => {},
        setZoom: () => {},
        undo: () => {},
        redo: () => {},
        reset: () => {},
        addText: () => {},
        addShape: () => {},
        addImage: () => {},
        updateSelected: () => {},
        deleteSelected: () => {},
        duplicateSelected: () => {},
    };
}
