// ── Видео дефолты ──
export const VIDEO_DEFAULTS = {
    WIDTH: 1920,
    HEIGHT: 1080,
    FPS: 30,
    DURATION_SECONDS: 10,
} as const;

// ── Remotion ──
export const REMOTION_COMPOSITION_ID = "MotionAIVideo";
export const REMOTION_ENTRY_POINT = "./src/remotion/index.ts";

// ── Лимиты файлов ──
export const FILE_LIMITS = {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024,   // 10 MB
    MAX_VIDEO_SIZE: 500 * 1024 * 1024,  // 500 MB
    MAX_AUDIO_SIZE: 50 * 1024 * 1024,   // 50 MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
    ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
} as const;

// ── Пути ──
export const PATHS = {
    UPLOADS_DIR: "public/uploads",
    ASSETS_DIR: "public/uploads/assets",
    RENDERS_DIR: "public/uploads/renders",
} as const;

// ── AI ──
export const AI_DEFAULTS = {
    MODEL: "claude-3-5-sonnet-20240620",
    MAX_TOKENS: 8192,
    TEMPERATURE: 0.7,
} as const;

// ── Пагинация ──
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

// ── Кэш (ISR revalidate) ──
export const CACHE_TTL = {
    SHORT: 60,           // 1 мин
    MEDIUM: 60 * 5,      // 5 мин
    LONG: 60 * 60,       // 1 час
    DAY: 60 * 60 * 24,   // 24 ч
} as const;

// ── Статусы генерации ──
export const GENERATION_POLL_INTERVAL_MS = 2000;
export const GENERATION_TIMEOUT_MS = 120_000;

// ── Приложение ──
export const APP_NAME = "MotionAI";
export const APP_URL =
    process.env.NEXTAUTH_URL ?? "http://localhost:3000";
