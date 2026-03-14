import { VIDEO_DEFAULTS } from "@/lib/constants";
import type { Scene } from "@/types/editor";
import type { ProjectSettings } from "@/types/project";

/** Переводит секунды в кадры */
export function secondsToFrames(
    seconds: number,
    fps: number = VIDEO_DEFAULTS.FPS
): number {
    return Math.round(seconds * fps);
}

/** Переводит кадры в секунды */
export function framesToSeconds(
    frames: number,
    fps: number = VIDEO_DEFAULTS.FPS
): number {
    return frames / fps;
}

/** Вычисляет общую длительность (в кадрах) из массива сцен */
export function getTotalDurationInFrames(scenes: Scene[]): number {
    return scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}

/** Вычисляет стартовый кадр сцены по её индексу */
export function getSceneStartFrame(
    scenes: Scene[],
    sceneIndex: number
): number {
    let frame = 0;
    for (let i = 0; i < sceneIndex && i < scenes.length; i++) {
        frame += scenes[i].durationInFrames;
    }
    return frame;
}

/** Возвращает конфигурацию для Remotion Player */
export function getCompositionConfig(settings: ProjectSettings) {
    return {
        width: settings.width ?? VIDEO_DEFAULTS.WIDTH,
        height: settings.height ?? VIDEO_DEFAULTS.HEIGHT,
        fps: settings.fps ?? VIDEO_DEFAULTS.FPS,
        durationInFrames: secondsToFrames(
            settings.duration ?? VIDEO_DEFAULTS.DURATION_SECONDS,
            settings.fps ?? VIDEO_DEFAULTS.FPS
        ),
    };
}

/** Возвращает aspect ratio строкой */
export function getAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
}

/** Форматирует номер кадра в таймкод HH:MM:SS:FF */
export function frameToTimecode(
    frame: number,
    fps: number = VIDEO_DEFAULTS.FPS
): string {
    const totalSeconds = frame / fps;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const remainingFrames = frame % fps;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
        String(remainingFrames).padStart(2, "0"),
    ].join(":");
}
