import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PATHS, FILE_LIMITS } from "@/lib/constants";
import { ValidationError } from "@/lib/errors";

export type AssetType = "IMAGE" | "VIDEO" | "AUDIO";

/** Определяет тип ассета по MIME */
export function getAssetType(mimeType: string): AssetType {
    if (FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(mimeType as never)) return "IMAGE";
    if (FILE_LIMITS.ALLOWED_VIDEO_TYPES.includes(mimeType as never)) return "VIDEO";
    if (FILE_LIMITS.ALLOWED_AUDIO_TYPES.includes(mimeType as never)) return "AUDIO";
    throw new ValidationError("Неподдерживаемый тип файла", {
        mimeType: `Тип ${mimeType} не поддерживается`,
    });
}

/** Проверяет размер файла по типу */
export function validateFileSize(size: number, assetType: AssetType): void {
    const limits: Record<string, number> = {
        IMAGE: FILE_LIMITS.MAX_IMAGE_SIZE,
        VIDEO: FILE_LIMITS.MAX_VIDEO_SIZE,
        AUDIO: FILE_LIMITS.MAX_AUDIO_SIZE,
    };

    const max = limits[assetType];
    if (max && size > max) {
        const maxMB = Math.round(max / (1024 * 1024));
        throw new ValidationError("Файл слишком большой", {
            size: `Максимальный размер для ${assetType}: ${maxMB} MB`,
        });
    }
}

/** Генерирует уникальное имя файла с сохранением расширения */
export function generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
}

/** Полный путь к директории загрузок ассетов */
export function getAssetsDir(): string {
    return path.join(process.cwd(), PATHS.ASSETS_DIR);
}

/** Полный путь к директории рендеров */
export function getRendersDir(): string {
    return path.join(process.cwd(), PATHS.RENDERS_DIR);
}

/** Создаёт директорию если не существует */
export async function ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
}

/** Сохраняет файл на диск и возвращает публичный URL */
export async function saveFile(
    buffer: Buffer,
    originalName: string
): Promise<{ filename: string; url: string; fullPath: string }> {
    const dir = getAssetsDir();
    await ensureDir(dir);

    const filename = generateUniqueFilename(originalName);
    const fullPath = path.join(dir, filename);

    await fs.writeFile(fullPath, buffer);

    // URL относительно public/
    const url = `/uploads/assets/${filename}`;

    return { filename, url, fullPath };
}

/** Удаляет файл с диска (по URL) */
export async function deleteFile(url: string): Promise<void> {
    // URL = /uploads/assets/xxx.png → public/uploads/assets/xxx.png
    const relativePath = path.join("public", url);
    const fullPath = path.join(process.cwd(), relativePath);

    try {
        await fs.unlink(fullPath);
    } catch (err) {
        // Файл мог быть уже удалён — не бросаем ошибку
        console.warn(`[deleteFile] Не удалось удалить файл: ${fullPath}`, err);
    }
}

/** Проверяет существование файла */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}
