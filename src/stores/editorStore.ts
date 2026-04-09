// Legacy editorStore — DEPRECATED
// Replaced by modular stores:
//   compositionStore, layerStore, keyframeStore, effectsStore,
//   timelineStore, selectionStore, historyStore
//
// This is a minimal stub to prevent import errors from legacy components.

import { create } from "zustand";

interface LegacyEditorState {
    projectId: string | null;
}

export const useEditorStore = create<LegacyEditorState>()(() => ({
    projectId: null,
}));

// Legacy factory stubs
export function createTextElement() { return {} as any; }
export function createImageElement() { return {} as any; }
export function createShapeElement() { return {} as any; }
export function createAudioElement() { return {} as any; }
export function createVideoElement() { return {} as any; }
