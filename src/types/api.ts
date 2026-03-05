// ── Стандартный ответ API ──
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ── Пагинированный ответ ──
export interface PaginatedResponse<T = unknown> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ── Запрос на генерацию ──
export interface GenerationRequest {
    projectId: string;
    prompt: string;
    /** Контекст предыдущего кода для итерации */
    previousCode?: string;
}

// ── Ответ генерации ──
export interface GenerationResponse {
    id: string;
    generatedCode: string;
    inputTokens: number;
    outputTokens: number;
}

// ── Загрузка файла ──
export interface UploadResponse {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

// ── Ошибка валидации ──
export interface ValidationError {
    field: string;
    message: string;
}

// ── Утилита для создания успешного ответа ──
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return { success: true, data, message };
}

// ── Утилита для создания ответа с ошибкой ──
export function errorResponse(error: string): ApiResponse {
    return { success: false, error };
}
