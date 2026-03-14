import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/generate — AI генерация сцен через Claude
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey || apiKey.length < 10) {
            return NextResponse.json(
                { error: "ANTHROPIC_API_KEY не настроен в .env файле" },
                { status: 500 }
            );
        }

        const { prompt } = await req.json();
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "Промпт обязателен" }, { status: 400 });
        }

        const systemPrompt = `Ты — MotionAI, AI ассистент по созданию видео. Пользователь описывает видео, которое хочет создать.
Ты должен вернуть JSON-массив сцен для видеоредактора.

Каждая сцена содержит:
- name: название сцены
- durationInFrames: продолжительность в кадрах (30fps)
- backgroundColor: цвет фона (#hex)
- elements: массив элементов (TEXT, IMAGE, SHAPE)

Каждый элемент содержит:
- type: "TEXT" | "IMAGE" | "SHAPE"
- x, y: координаты (0-1920, 0-1080)
- width, height: размеры
- from: начальный кадр
- durationInFrames: длительность элемента
- opacity: 0-1
- rotation: градусы
- zIndex: порядок слоя

Для TEXT дополнительно: content, style { fontSize, fontWeight, color, fontFamily }
Для SHAPE дополнительно: fill, borderRadius
Для IMAGE дополнительно: src (используй placeholder URL)

Ответь ТОЛЬКО валидным JSON без комментариев и markdown.`;

        // Прямой вызов Anthropic API через fetch (без SDK, для надёжности)
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 4096,
                system: systemPrompt,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("[GENERATE] Anthropic API error:", response.status, errBody);
            
            if (response.status === 401) {
                return NextResponse.json(
                    { error: "Невалидный API ключ Anthropic. Проверьте ANTHROPIC_API_KEY в .env" },
                    { status: 500 }
                );
            }
            if (response.status === 429) {
                return NextResponse.json(
                    { error: "Превышен лимит запросов к API. Подождите немного и попробуйте снова." },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { error: `Ошибка Anthropic API (${response.status}): ${errBody.slice(0, 200)}` },
                { status: 500 }
            );
        }

        const message = await response.json();

        // Извлекаем текст из ответа
        const textBlock = message.content?.find((block: { type: string }) => block.type === "text");
        if (!textBlock) {
            return NextResponse.json({ error: "AI не вернул текст" }, { status: 500 });
        }

        // Парсим JSON из ответа
        let scenes;
        try {
            scenes = JSON.parse(textBlock.text);
        } catch {
            return NextResponse.json(
                { error: "AI вернул невалидный JSON", raw: textBlock.text },
                { status: 500 }
            );
        }

        return NextResponse.json({
            scenes,
            usage: message.usage,
        });
    } catch (error) {
        console.error("[GENERATE_POST]", error);
        const message = error instanceof Error ? error.message : "Неизвестная ошибка";
        return NextResponse.json({ error: `Ошибка генерации: ${message}` }, { status: 500 });
    }
}

