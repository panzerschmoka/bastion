import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type {
    EditorState,
    Scene,
    SceneElement,
    TextElement,
    ImageElement,
    VideoElement,
    ShapeElement,
    AudioElement,
} from "@/types/editor";
import { DEFAULT_ELEMENT_PROPS } from "@/types/editor";

// ── Максимальная глубина истории ──
const MAX_HISTORY = 50;

// ── Интерфейс экшенов редактора ──
interface EditorActions {
    // Проект
    setProjectId: (id: string | null) => void;

    // Сцены
    addScene: () => void;
    removeScene: (sceneId: string) => void;
    setActiveScene: (index: number) => void;
    updateScene: (sceneId: string, patch: Partial<Omit<Scene, "id" | "elements">>) => void;
    reorderScenes: (fromIndex: number, toIndex: number) => void;

    // Элементы
    addElement: (element: SceneElement) => void;
    removeElement: (elementId: string) => void;
    selectElement: (elementId: string | null) => void;
    updateElement: (elementId: string, patch: Partial<SceneElement>) => void;
    duplicateElement: (elementId: string) => void;

    // Таймлайн / плеер
    setCurrentFrame: (frame: number) => void;
    setPlaying: (playing: boolean) => void;
    setZoom: (zoom: number) => void;

    // История
    undo: () => void;
    redo: () => void;
    snapshot: () => void;

    // Утилиты
    reset: () => void;
}

// ── Дефолтная сцена ──
function createDefaultScene(): Scene {
    return {
        id: nanoid(),
        name: "Сцена 1",
        durationInFrames: 150,
        backgroundColor: "#0a0a0a",
        elements: [],
        order: 0,
    };
}

// ── Начальное состояние ──
const initialState: EditorState = {
    projectId: null,
    scenes: [createDefaultScene()],
    activeSceneIndex: 0,
    selectedElementId: null,
    currentFrame: 0,
    isPlaying: false,
    zoom: 1,
    undoStack: [],
    redoStack: [],
};

// ── Вспомогательная функция: сериализация состояния для истории ──
function serializeState(state: EditorState): string {
    return JSON.stringify({
        scenes: state.scenes,
        activeSceneIndex: state.activeSceneIndex,
    });
}

// ── Zustand Store ──
export const useEditorStore = create<EditorState & EditorActions>()(
    devtools(
        persist(
            immer((set, get) => ({
                ...initialState,

                // ── Проект ──
                setProjectId: (id) =>
                    set((s) => {
                        s.projectId = id;
                    }),

                // ── Сцены ──
                addScene: () =>
                    set((s) => {
                        const newScene: Scene = {
                            id: nanoid(),
                            name: `Сцена ${s.scenes.length + 1}`,
                            durationInFrames: 150,
                            backgroundColor: "#0a0a0a",
                            elements: [],
                            order: s.scenes.length,
                        };
                        s.scenes.push(newScene);
                        s.activeSceneIndex = s.scenes.length - 1;
                    }),

                removeScene: (sceneId) =>
                    set((s) => {
                        if (s.scenes.length === 1) return; // минимум одна сцена
                        const idx = s.scenes.findIndex((sc) => sc.id === sceneId);
                        if (idx === -1) return;
                        s.scenes.splice(idx, 1);
                        s.scenes.forEach((sc: Scene, i: number) => { sc.order = i; });
                        if (s.activeSceneIndex >= s.scenes.length) {
                            s.activeSceneIndex = s.scenes.length - 1;
                        }
                    }),

                setActiveScene: (index) =>
                    set((s) => {
                        s.activeSceneIndex = index;
                        s.selectedElementId = null;
                        s.currentFrame = 0;
                    }),

                updateScene: (sceneId, patch) =>
                    set((s) => {
                        const scene = s.scenes.find((sc: Scene) => sc.id === sceneId);
                        if (!scene) return;
                        Object.assign(scene, patch);
                    }),

                reorderScenes: (fromIndex, toIndex) =>
                    set((s) => {
                        const [removed] = s.scenes.splice(fromIndex, 1);
                        s.scenes.splice(toIndex, 0, removed);
                        s.scenes.forEach((sc: Scene, i: number) => { sc.order = i; });
                    }),

                // ── Элементы ──
                addElement: (element) =>
                    set((s) => {
                        const scene = s.scenes[s.activeSceneIndex];
                        if (!scene) return;
                        scene.elements.push(element);
                        s.selectedElementId = element.id;
                    }),

                removeElement: (elementId) =>
                    set((s) => {
                        const scene = s.scenes[s.activeSceneIndex];
                        if (!scene) return;
                        scene.elements = scene.elements.filter((el: SceneElement) => el.id !== elementId);
                        if (s.selectedElementId === elementId) {
                            s.selectedElementId = null;
                        }
                    }),

                selectElement: (elementId) =>
                    set((s) => {
                        s.selectedElementId = elementId;
                    }),

                updateElement: (elementId, patch) =>
                    set((s) => {
                        const scene = s.scenes[s.activeSceneIndex];
                        if (!scene) return;
                        const el = scene.elements.find((e: SceneElement) => e.id === elementId);
                        if (!el) return;
                        Object.assign(el, patch);
                    }),

                duplicateElement: (elementId) =>
                    set((s) => {
                        const scene = s.scenes[s.activeSceneIndex];
                        if (!scene) return;
                        const el = scene.elements.find((e: SceneElement) => e.id === elementId);
                        if (!el) return;
                        const clone = {
                            ...structuredClone(el),
                            id: nanoid(),
                            x: el.x + 20,
                            y: el.y + 20,
                            zIndex: el.zIndex + 1,
                        };
                        scene.elements.push(clone as SceneElement);
                        s.selectedElementId = clone.id;
                    }),

                // ── Таймлайн / плеер ──
                setCurrentFrame: (frame) =>
                    set((s) => {
                        s.currentFrame = frame;
                    }),

                setPlaying: (playing) =>
                    set((s) => {
                        s.isPlaying = playing;
                    }),

                setZoom: (zoom) =>
                    set((s) => {
                        s.zoom = Math.min(2, Math.max(0.25, zoom));
                    }),

                // ── История ──
                snapshot: () => {
                    const state = get();
                    const snap = serializeState(state);
                    set((s) => {
                        s.undoStack.push(snap);
                        if (s.undoStack.length > MAX_HISTORY) s.undoStack.shift();
                        s.redoStack = [];
                    });
                },

                undo: () => {
                    const state = get();
                    if (state.undoStack.length === 0) return;
                    const currentSnap = serializeState(state);
                    const prevSnap = state.undoStack[state.undoStack.length - 1];
                    const parsed = JSON.parse(prevSnap);
                    set((s) => {
                        s.redoStack.push(currentSnap);
                        s.undoStack.pop();
                        s.scenes = parsed.scenes;
                        s.activeSceneIndex = parsed.activeSceneIndex;
                        s.selectedElementId = null;
                    });
                },

                redo: () => {
                    const state = get();
                    if (state.redoStack.length === 0) return;
                    const currentSnap = serializeState(state);
                    const nextSnap = state.redoStack[state.redoStack.length - 1];
                    const parsed = JSON.parse(nextSnap);
                    set((s) => {
                        s.undoStack.push(currentSnap);
                        s.redoStack.pop();
                        s.scenes = parsed.scenes;
                        s.activeSceneIndex = parsed.activeSceneIndex;
                        s.selectedElementId = null;
                    });
                },

                // ── Сброс ──
                reset: () =>
                    set(() => ({
                        ...initialState,
                        scenes: [createDefaultScene()],
                    })),
            })),
            {
                name: "motionai-editor",
                partialize: (state) => ({
                    projectId: state.projectId,
                    scenes: state.scenes,
                    activeSceneIndex: state.activeSceneIndex,
                    zoom: state.zoom,
                }),
            }
        ),
        { name: "EditorStore" }
    )
);

// ── Типизированные фабрики для создания элементов ──
export function createTextElement(overrides?: Partial<TextElement>): TextElement {
    return {
        ...DEFAULT_ELEMENT_PROPS,
        id: nanoid(),
        type: "TEXT",
        content: "Новый текст",
        style: {
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
            fontWeight: "700",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: 0,
        },
        ...overrides,
    };
}

export function createImageElement(src: string, overrides?: Partial<ImageElement>): ImageElement {
    return {
        ...DEFAULT_ELEMENT_PROPS,
        id: nanoid(),
        type: "IMAGE",
        src,
        alt: "Изображение",
        objectFit: "cover",
        ...overrides,
    };
}

export function createVideoElement(src: string, overrides?: Partial<VideoElement>): VideoElement {
    return {
        ...DEFAULT_ELEMENT_PROPS,
        id: nanoid(),
        type: "VIDEO",
        src,
        volume: 1,
        startFrom: 0,
        muted: false,
        ...overrides,
    };
}

export function createShapeElement(overrides?: Partial<ShapeElement>): ShapeElement {
    return {
        ...DEFAULT_ELEMENT_PROPS,
        id: nanoid(),
        type: "SHAPE",
        shape: "rectangle",
        fill: "#6366f1",
        stroke: "transparent",
        strokeWidth: 0,
        borderRadius: 8,
        ...overrides,
    };
}

export function createAudioElement(src: string, overrides?: Partial<AudioElement>): AudioElement {
    return {
        ...DEFAULT_ELEMENT_PROPS,
        id: nanoid(),
        type: "AUDIO",
        src,
        volume: 1,
        startFrom: 0,
        ...overrides,
    };
}
