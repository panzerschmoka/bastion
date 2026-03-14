/** Базовая ошибка приложения */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

/** Ошибка авторизации (401) */
export class UnauthorizedError extends AppError {
    constructor(message = "Необходима авторизация") {
        super(message, 401, "UNAUTHORIZED");
        this.name = "UnauthorizedError";
    }
}

/** Ошибка доступа (403) */
export class ForbiddenError extends AppError {
    constructor(message = "Доступ запрещён") {
        super(message, 403, "FORBIDDEN");
        this.name = "ForbiddenError";
    }
}

/** Ресурс не найден (404) */
export class NotFoundError extends AppError {
    constructor(resource = "Ресурс") {
        super(`${resource} не найден`, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}

/** Ошибка валидации (422) */
export class ValidationError extends AppError {
    public readonly fields: Record<string, string>;

    constructor(
        message = "Ошибка валидации данных",
        fields: Record<string, string> = {}
    ) {
        super(message, 422, "VALIDATION_ERROR");
        this.name = "ValidationError";
        this.fields = fields;
    }
}

/** Конфликт (409) */
export class ConflictError extends AppError {
    constructor(message = "Конфликт данных") {
        super(message, 409, "CONFLICT");
        this.name = "ConflictError";
    }
}

/** Лимит запросов exceeded (429) */
export class RateLimitError extends AppError {
    constructor(message = "Слишком много запросов. Попробуйте позже") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
        this.name = "RateLimitError";
    }
}

/** Внешний сервис недоступен (503) */
export class ExternalServiceError extends AppError {
    constructor(service: string, message?: string) {
        super(
            message ?? `Внешний сервис ${service} недоступен`,
            503,
            "EXTERNAL_SERVICE_ERROR"
        );
        this.name = "ExternalServiceError";
    }
}

/** Определяет HTTP статус из любой ошибки */
export function getErrorStatusCode(error: unknown): number {
    if (error instanceof AppError) return error.statusCode;
    return 500;
}

/** Определяет пользовательское сообщение из любой ошибки */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) return error.message;
    if (error instanceof Error) return "Произошла непредвиденная ошибка";
    return "Произошла непредвиденная ошибка";
}
