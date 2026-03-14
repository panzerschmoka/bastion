import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, getErrorStatusCode } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";

/** Создаёт успешный JSON-ответ */
export function apiSuccess<T>(
    data: T,
    message?: string,
    status = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        { success: true, data, message },
        { status }
    );
}

/** Создаёт ответ с ошибкой */
export function apiError(
    error: unknown,
    defaultMessage = "Произошла ошибка"
): NextResponse<ApiResponse<null>> {
    // Zod validation error
    if (error instanceof ZodError) {
        const fields: Record<string, string> = {};
        error.errors.forEach((e) => {
            const key = e.path.join(".");
            fields[key] = e.message;
        });
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Ошибка валидации данных",
                errors: fields,
            },
            { status: 422 }
        );
    }

    // Custom App errors
    if (error instanceof AppError) {
        return NextResponse.json(
            { success: false, data: null, message: error.message },
            { status: error.statusCode }
        );
    }

    // Unknown errors
    console.error("[API Error]", error);
    return NextResponse.json(
        { success: false, data: null, message: defaultMessage },
        { status: getErrorStatusCode(error) }
    );
}

/** Создаёт 201 Created ответ */
export function apiCreated<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return apiSuccess(data, message, 201);
}

/** Создаёт 204 No Content ответ */
export function apiNoContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
}
