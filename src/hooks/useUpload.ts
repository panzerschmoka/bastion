import { useState, useCallback, useRef } from "react";
import type { UploadResponse } from "@/types/api";

interface UploadOptions {
    onProgress?: (percent: number) => void;
    accept?: string[];
    maxSizeMB?: number;
}

interface UseUploadReturn {
    isUploading: boolean;
    progress: number;
    error: string | null;
    uploadFile: (file: File, options?: UploadOptions) => Promise<UploadResponse | null>;
    reset: () => void;
}

const DEFAULT_MAX_SIZE_MB = 100;

export function useUpload(): UseUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const reset = useCallback(() => {
        setIsUploading(false);
        setProgress(0);
        setError(null);
        abortRef.current?.abort();
    }, []);

    const uploadFile = useCallback(
        async (file: File, options?: UploadOptions): Promise<UploadResponse | null> => {
            const maxSizeMB = options?.maxSizeMB ?? DEFAULT_MAX_SIZE_MB;
            const accept = options?.accept;

            // ── Клиентская валидация ──
            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`Файл слишком большой. Максимальный размер — ${maxSizeMB} МБ`);
                return null;
            }
            if (accept && accept.length > 0) {
                const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
                const mime = file.type;
                const isAllowed = accept.some(
                    (a) => a.startsWith(".") ? a.slice(1) === ext : mime.startsWith(a)
                );
                if (!isAllowed) {
                    setError(`Неподдерживаемый тип файла. Допустимо: ${accept.join(", ")}`);
                    return null;
                }
            }

            setIsUploading(true);
            setProgress(0);
            setError(null);

            abortRef.current = new AbortController();

            try {
                const formData = new FormData();
                formData.append("file", file);

                // Используем XMLHttpRequest для отслеживания прогресса
                const response = await new Promise<UploadResponse>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", "/api/upload");

                    xhr.upload.addEventListener("progress", (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            setProgress(percent);
                            options?.onProgress?.(percent);
                        }
                    });

                    xhr.addEventListener("load", () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                resolve(JSON.parse(xhr.responseText) as UploadResponse);
                            } catch {
                                reject(new Error("Некорректный ответ сервера"));
                            }
                        } else {
                            try {
                                const body = JSON.parse(xhr.responseText);
                                reject(new Error(body.message ?? "Ошибка загрузки файла"));
                            } catch {
                                reject(new Error("Ошибка загрузки файла"));
                            }
                        }
                    });

                    xhr.addEventListener("error", () => reject(new Error("Сетевая ошибка")));
                    xhr.addEventListener("abort", () => reject(new Error("Загрузка отменена")));

                    // Подключаем AbortController к XHR
                    abortRef.current?.signal.addEventListener("abort", () => xhr.abort());

                    xhr.send(formData);
                });

                setProgress(100);
                return response;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
                if (msg !== "Загрузка отменена") {
                    setError(msg);
                }
                return null;
            } finally {
                setIsUploading(false);
            }
        },
        []
    );

    return { isUploading, progress, error, uploadFile, reset };
}
