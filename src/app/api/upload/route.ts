import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/webm", "video/quicktime",
    "audio/mpeg", "audio/wav", "audio/ogg",
    "font/ttf", "font/otf", "font/woff", "font/woff2",
];

// POST /api/upload — Загрузка файла
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Максимальный размер файла: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Неподдерживаемый тип файла: ${file.type}` },
                { status: 400 }
            );
        }

        // Создаём папку пользователя
        const userDir = path.join(UPLOAD_DIR, session.user.id);
        await mkdir(userDir, { recursive: true });

        // Сохраняем файл
        const ext = path.extname(file.name) || ".bin";
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(userDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const url = `/uploads/${session.user.id}/${filename}`;

        return NextResponse.json({
            url,
            filename: file.name,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error("[UPLOAD_POST]", error);
        return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
    }
}
