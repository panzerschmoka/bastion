import type {
    Project,
    Video,
    Asset,
    Generation,
} from "@prisma/client";

// ── SQLite Schema Maps Enums to Strings ──
export type ProjectStatus = "DRAFT" | "RENDERING" | "COMPLETED" | "FAILED";
export type AssetType = "IMAGE" | "VIDEO" | "AUDIO";

// ── Настройки проекта (хранятся в JSON-поле) ──
export interface ProjectSettings {
    fps: number;
    width: number;
    height: number;
    backgroundColor: string;
    duration: number;
}

// ── Проект со связями ──
export interface ProjectWithRelations extends Project {
    videos: Video[];
    assets: Asset[];
    generations: Generation[];
}

// ── Проект с автором ──
export interface ProjectWithUser extends Project {
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

// ── Формы создания/обновления ──
export interface CreateProjectInput {
    title: string;
    description?: string;
    settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectInput {
    title?: string;
    description?: string;
    settings?: Partial<ProjectSettings>;
    status?: ProjectStatus;
}

// ── Дефолтные настройки проекта ──
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
    fps: 30,
    width: 1920,
    height: 1080,
    backgroundColor: "#000000",
    duration: 10,
};
