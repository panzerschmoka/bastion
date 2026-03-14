import { useCallback, useEffect } from "react";
import { useEditorStore, createTextElement, createImageElement, createShapeElement } from "@/stores/editorStore";
import type { SceneElement } from "@/types/editor";

/**
 * Хук для работы с редактором.
 * Инкапсулирует логику взаимодействия с editorStore и hotkeys.
 */
export function useEditor() {
    const store = useEditorStore();

    const activeScene = store.scenes[store.activeSceneIndex] ?? null;
    const selectedElement =
        activeScene?.elements.find((el) => el.id === store.selectedElementId) ?? null;

    // ── Добавление элементов ──
    const addText = useCallback(() => {
        store.snapshot();
        store.addElement(createTextElement());
    }, [store]);

    const addShape = useCallback(() => {
        store.snapshot();
        store.addElement(createShapeElement());
    }, [store]);

    const addImage = useCallback((src: string) => {
        store.snapshot();
        store.addElement(createImageElement(src));
    }, [store]);

    // ── Обновление выбранного элемента ──
    const updateSelected = useCallback(
        (patch: Partial<SceneElement>) => {
            if (!store.selectedElementId) return;
            store.snapshot();
            store.updateElement(store.selectedElementId, patch);
        },
        [store]
    );

    // ── Удаление выбранного элемента ──
    const deleteSelected = useCallback(() => {
        if (!store.selectedElementId) return;
        store.snapshot();
        store.removeElement(store.selectedElementId);
    }, [store]);

    // ── Дублирование выбранного элемента ──
    const duplicateSelected = useCallback(() => {
        if (!store.selectedElementId) return;
        store.snapshot();
        store.duplicateElement(store.selectedElementId);
    }, [store]);

    // ── Клавиатурные ярлыки ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Не перехватываем если фокус в input/textarea
            if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                store.undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
                e.preventDefault();
                store.redo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "d") {
                e.preventDefault();
                duplicateSelected();
            }
            if (e.key === "Delete" || e.key === "Backspace") {
                deleteSelected();
            }
            if (e.key === "Escape") {
                store.selectElement(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [store, deleteSelected, duplicateSelected]);

    return {
        // Состояние
        projectId: store.projectId,
        scenes: store.scenes,
        activeSceneIndex: store.activeSceneIndex,
        activeScene,
        selectedElementId: store.selectedElementId,
        selectedElement,
        currentFrame: store.currentFrame,
        isPlaying: store.isPlaying,
        zoom: store.zoom,
        canUndo: store.undoStack.length > 0,
        canRedo: store.redoStack.length > 0,

        // Экшены (из store)
        setProjectId: store.setProjectId,
        addScene: store.addScene,
        removeScene: store.removeScene,
        setActiveScene: store.setActiveScene,
        updateScene: store.updateScene,
        reorderScenes: store.reorderScenes,
        selectElement: store.selectElement,
        setCurrentFrame: store.setCurrentFrame,
        setPlaying: store.setPlaying,
        setZoom: store.setZoom,
        undo: store.undo,
        redo: store.redo,
        reset: store.reset,

        // Составные экшены (из хука)
        addText,
        addShape,
        addImage,
        updateSelected,
        deleteSelected,
        duplicateSelected,
    };
}
