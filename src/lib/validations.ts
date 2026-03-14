import { z } from "zod";

// ── Auth schemas ──

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email обязателен")
        .email("Некорректный формат email"),
    password: z
        .string()
        .min(1, "Пароль обязателен")
        .min(6, "Пароль должен быть не менее 6 символов"),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, "Имя обязательно")
        .max(100, "Имя слишком длинное"),
    email: z
        .string()
        .min(1, "Email обязателен")
        .email("Некорректный формат email"),
    password: z
        .string()
        .min(6, "Пароль должен быть не менее 6 символов")
        .max(128, "Пароль слишком длинный"),
});

// ── Project schemas ──

export const createProjectSchema = z.object({
    title: z
        .string()
        .min(1, "Название обязательно")
        .max(200, "Название слишком длинное"),
    description: z
        .string()
        .max(2000, "Описание слишком длинное")
        .optional(),
    settings: z
        .object({
            fps: z.number().int().min(1).max(120).optional(),
            width: z.number().int().min(100).max(7680).optional(),
            height: z.number().int().min(100).max(4320).optional(),
            backgroundColor: z.string().optional(),
            duration: z.number().min(1).max(600).optional(),
        })
        .optional(),
});

export const updateProjectSchema = z.object({
    title: z
        .string()
        .min(1, "Название обязательно")
        .max(200, "Название слишком длинное")
        .optional(),
    description: z
        .string()
        .max(2000, "Описание слишком длинное")
        .nullable()
        .optional(),
    settings: z
        .object({
            fps: z.number().int().min(1).max(120).optional(),
            width: z.number().int().min(100).max(7680).optional(),
            height: z.number().int().min(100).max(4320).optional(),
            backgroundColor: z.string().optional(),
            duration: z.number().min(1).max(600).optional(),
        })
        .optional(),
    status: z
        .enum(["DRAFT", "RENDERING", "COMPLETED", "FAILED"])
        .optional(),
});

// ── Generation schemas ──

export const generateCodeSchema = z.object({
    projectId: z.string().min(1, "ID проекта обязателен"),
    prompt: z
        .string()
        .min(1, "Промпт обязателен")
        .max(10000, "Промпт слишком длинный"),
    previousCode: z.string().optional(),
});

// ── Pagination schema ──

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── ID param schema ──

export const idParamSchema = z.object({
    id: z.string().cuid("Некорректный ID"),
});

// ── TypeScript-типы из схем ──
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProjectSchemaInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchemaInput = z.infer<typeof updateProjectSchema>;
export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
