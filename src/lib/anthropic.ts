import Anthropic from "@anthropic-ai/sdk";
import { AI_DEFAULTS } from "@/lib/constants";
import { ExternalServiceError } from "@/lib/errors";

// Singleton-клиент Anthropic
const globalForAnthropic = globalThis as unknown as {
    anthropic: Anthropic | undefined;
};

function getAnthropicClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new ExternalServiceError(
            "Anthropic",
            "ANTHROPIC_API_KEY не задан в .env"
        );
    }

    if (!globalForAnthropic.anthropic) {
        globalForAnthropic.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    return globalForAnthropic.anthropic;
}

export const anthropic = getAnthropicClient;

/** Параметры для генерации Remotion-кода */
export interface GenerateCodeParams {
    prompt: string;
    previousCode?: string;
    model?: string;
    maxTokens?: number;
}

/** Генерирует Remotion-код через Claude API */
export async function generateRemotionCode({
    prompt,
    previousCode,
    model = AI_DEFAULTS.MODEL,
    maxTokens = AI_DEFAULTS.MAX_TOKENS,
}: GenerateCodeParams): Promise<{
    code: string;
    inputTokens: number;
    outputTokens: number;
}> {
    const client = getAnthropicClient();

    const systemPrompt = `Ты — экспертный разработчик Remotion (React-библиотека для программного создания видео).
Ты генерируешь ТОЛЬКО валидный TypeScript/React код для Remotion-композиций.
Правила:
- Используй import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence, Img, Audio, Video } from "remotion";
- НЕ используй внешние библиотеки кроме remotion.
- Код должен быть полностью самодостаточным.
- Экспортируй компонент по умолчанию (export default).
- Добавляй JSDoc-комментарии к основному компоненту.
- Ответ должен содержать ТОЛЬКО код, без пояснений.`;

    const userMessage = previousCode
        ? `Предыдущий код:\n\`\`\`tsx\n${previousCode}\n\`\`\`\n\nЗапрос на изменение: ${prompt}`
        : prompt;

    const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: AI_DEFAULTS.TEMPERATURE,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
    });

    // Извлекаем текст из ответа
    const textBlock = response.content.find((block) => block.type === "text");
    const rawCode = textBlock?.text ?? "";

    // Убираем markdown code fences если есть
    const code = rawCode
        .replace(/^```(?:tsx?|javascript|jsx)?\n/gm, "")
        .replace(/\n```$/gm, "")
        .trim();

    return {
        code,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}
