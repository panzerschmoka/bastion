// ── Типы элементов сцены ──
export type ElementType = "TEXT" | "IMAGE" | "VIDEO" | "SHAPE" | "AUDIO";

// ── Базовые свойства элемента ──
export interface BaseElement {
    id: string;
    type: ElementType;
    /** Начальный фрейм (от начала сцены) */
    from: number;
    /** Длительность в фреймах */
    durationInFrames: number;
    /** Позиция по X (px) */
    x: number;
    /** Позиция по Y (px) */
    y: number;
    /** Ширина (px) */
    width: number;
    /** Высота (px) */
    height: number;
    /** Прозрачность 0-1 */
    opacity: number;
    /** Поворот (deg) */
    rotation: number;
    /** Z-порядок */
    zIndex: number;
}

// ── Текстовый элемент ──
export interface TextElement extends BaseElement {
    type: "TEXT";
    content: string;
    style: {
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        color: string;
        textAlign: "left" | "center" | "right";
        lineHeight: number;
        letterSpacing: number;
    };
}

// ── Элемент-изображение ──
export interface ImageElement extends BaseElement {
    type: "IMAGE";
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
}

// ── Видео-элемент ──
export interface VideoElement extends BaseElement {
    type: "VIDEO";
    src: string;
    volume: number;
    startFrom: number;
    muted: boolean;
}

// ── Фигура ──
export interface ShapeElement extends BaseElement {
    type: "SHAPE";
    shape: "rectangle" | "circle" | "triangle";
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius: number;
}

// ── Аудио-элемент ──
export interface AudioElement extends BaseElement {
    type: "AUDIO";
    src: string;
    volume: number;
    startFrom: number;
}

// ── Объединённый тип элемента ──
export type SceneElement =
    | TextElement
    | ImageElement
    | VideoElement
    | ShapeElement
    | AudioElement;

// ── Сцена ──
export interface Scene {
    id: string;
    name: string;
    durationInFrames: number;
    backgroundColor: string;
    elements: SceneElement[];
    /** Порядок сцены в видео */
    order: number;
}

// ── Трек таймлайна ──
export interface TimelineTrack {
    id: string;
    name: string;
    type: ElementType;
    locked: boolean;
    visible: boolean;
    elements: SceneElement[];
}

// ── Состояние редактора ──
export interface EditorState {
    /** Текущий проект */
    projectId: string | null;
    /** Список сцен */
    scenes: Scene[];
    /** Индекс активной сцены */
    activeSceneIndex: number;
    /** ID выбранного элемента */
    selectedElementId: string | null;
    /** Текущий фрейм на таймлайне */
    currentFrame: number;
    /** Воспроизводится ли видео */
    isPlaying: boolean;
    /** Масштаб превью (0.25–2) */
    zoom: number;
    /** Функции для навигации по истории */
    undoStack: string[];
    redoStack: string[];
}

// ── Дефолтные значения для нового элемента ──
export const DEFAULT_ELEMENT_PROPS: Omit<BaseElement, "id" | "type"> = {
    from: 0,
    durationInFrames: 90,
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    opacity: 1,
    rotation: 0,
    zIndex: 0,
};
