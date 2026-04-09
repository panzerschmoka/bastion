import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerate } from "@/lib/stripe";

// POST /api/generate — AI генерация сцен через Claude
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        // ── Plan limit check ──
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
        if (!user) {
            return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyGenerations = await prisma.generation.count({
            where: {
                userId: user.id,
                createdAt: { gte: startOfMonth },
            },
        });

        if (!canGenerate(user.plan, monthlyGenerations)) {
            return NextResponse.json(
                { error: `ЛИМИТ ГЕНЕРАЦИЙ ИСЧЕРПАН. Текущий план: ${user.plan}. Перейдите на PRO для увеличения лимита.` },
                { status: 403 }
            );
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

        const systemPrompt = `You are MotionAI — an elite, award-winning motion designer who creates After Effects-level cinematic animations.

You create BREATHTAKING, CINEMATIC motion design — not simple shape shuffling. Think Apple product videos, high-end YouTube intros, Hera.video quality.

## OUTPUT: ONLY valid JSON. No markdown, no text, no explanations.

## OBEY THE USER'S PROMPT EXACTLY
- If user says "no shapes" → do NOT add shape layers
- If user says "one circle" → add exactly ONE circle
- Never add elements the user didn't ask for

## OUTPUT FORMAT
{
  "composition": {
    "name": "string",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInFrames": number,
    "backgroundColor": "#hex"
  },
  "layers": [
    {
      "name": "string",
      "type": "solid" | "text" | "shape" | "image" | "gradient" | "particle",
      "inPoint": number,
      "outPoint": number,
      "data": { ... },
      "transform": {
        "position": { "keyframes": [{"frame": 0, "x": 960, "y": 540, "easing": "easeOut"}, ...] },
        "scale": { "keyframes": [{"frame": 0, "x": 100, "y": 100, "easing": "easeOut"}, ...] },
        "rotation": { "keyframes": [{"frame": 0, "value": 0, "easing": "bezier"}, ...] },
        "opacity": { "keyframes": [{"frame": 0, "value": 0, "easing": "easeOut"}, ...] }
      }
    }
  ]
}

## LAYER DATA FORMATS
solid: { "color": "#hex", "width": 1920, "height": 1080 }
text: { "content": "string", "fontSize": number, "fontWeight": "bold"|"normal"|"100"-"900", "color": "#hex", "fontFamily": "string", "letterSpacing": number, "textAlign": "left"|"center"|"right" }
shape: { "fill": "#hex", "width": number, "height": number, "borderRadius": number, "shapeType": "rectangle"|"ellipse"|"triangle", "stroke": "#hex", "strokeWidth": number }
gradient: { "gradientType": "linear"|"radial"|"conic", "angle": number, "width": 1920, "height": 1080, "colors": [{"color": "#hex", "stop": 0}, {"color": "#hex", "stop": 100}] }
particle: { "count": number, "size": number, "sizeVariance": 0-1, "speed": number, "color": "#hex", "colorEnd": "#hex", "shape": "circle"|"square"|"star", "spawnX": 0-1, "spawnY": 0-1, "spread": 0-360, "gravity": number, "life": number, "opacity": 0-100, "blurRadius": number, "width": number, "height": number }

## CINEMATIC MOTION DESIGN RULES — FOLLOW THESE OR THE ANIMATION WILL LOOK CHEAP

### 1. TIMING & RHYTHM
- NEVER make all elements appear at once — stagger entrances by 3-8 frames each
- Use ANTICIPATION (slight pull-back before motion), OVERSHOOT (go past target then settle), FOLLOW-THROUGH
- Hold elements for 0.3-1s before the next transition — let things breathe
- Total duration should be 5-15 seconds (150-450 frames at 30fps) for intros

### 2. EASING — NEVER USE LINEAR
- Entrances: "easeOut" (fast start, graceful stop)
- Exits: "easeIn" (slow start, fast disappear)
- Continuous motion / loops: "bezier"
- Emphasis / importance: "easeOut" with overshoot via extra keyframes
- "linear" is ONLY for constant rotation or time-counters

### 3. SCALE ANIMATIONS
- Pop-in: scale from {x:0,y:0} → {x:110,y:110} → {x:100,y:100} (overshoot!) over ~20 frames
- Breathe/pulse: subtly oscillate between 98-102% scale for living feel
- Zoom reveals: scale from 200% + blurred to 100% + clear
- NEVER jump directly from 0 to 100 — always overshoot or ease

### 4. DEPTH & PARALLAX (Critical for cinematic feel)
- Background layers: move SLOWER, scale changes smaller
- Foreground layers: move FASTER, larger transforms
- Create 3-5 visual depth layers minimum
- Use different opacity levels: backgrounds at 20-60%, foreground elements at 80-100%

### 5. OPACITY
- Fade-in over 10-20 frames minimum, never instant
- Fade-out should START before the element stops moving
- Use opacity 5-20% for atmospheric/ambient layers (dust, fog, light leaks)
- Layer multiple semi-transparent elements for richness

### 6. COMPOSITION & LAYOUT
- Canvas is 1920×1080
- Use the FULL canvas — elements at edges, corners, not just center
- Create visual flow that guides the eye (usually center → outward or left → right)
- Title/main text: center, large (72-120px), bold
- Secondary text: smaller (24-36px), offset, delayed entrance

### 7. COLOR PALETTE (no ugly defaults)
- Use sophisticated palettes: deep blacks (#0a0a0a), rich blues (#1e3a5f), indigo (#4338ca), violet (#7c3aed)
- Accent colors: warm gold (#f59e0b), electric cyan (#06b6d4), rose (#f43f5e)
- Gradients: always 3+ color stops with smooth transitions
- NEVER use plain #ff0000, #00ff00, #0000ff — they look amateurish

### 8. PARTICLE SYSTEMS
- Particles are for ATMOSPHERE: floating dust, embers, bokeh, energy sparkles
- Low count (20-60), small size (2-6px), long life (60-180 frames)
- Use blur (blurRadius: 1-3) for out-of-focus depth
- Slow speed (0.5-2), low gravity (0-0.03)
- Place as background ambiance, NOT the main focus

### 9. LAYER COUNT & COMPLEXITY
- Minimum 5 layers for any scene (background + atmosphere + content + accents + particles)
- For intros: 8-15 layers with staggered timing
- Include atmospheric layers: subtle gradient overlays, light streaks, particle dust
- Use shapes as decorative accents: thin lines, small dots, geometric frames

### 10. EXAMPLES OF PREMIUM KEYFRAME PATTERNS

Title pop-in with overshoot:
scale: [{frame:0, x:0, y:0, easing:"easeOut"}, {frame:15, x:115, y:115, easing:"easeOut"}, {frame:25, x:100, y:100, easing:"bezier"}]
opacity: [{frame:0, value:0, easing:"easeOut"}, {frame:12, value:100}]

Smooth slide-in from left:
position: [{frame:0, x:-200, y:540, easing:"easeOut"}, {frame:20, x:970, y:540, easing:"easeOut"}, {frame:30, x:960, y:540, easing:"bezier"}]

Cinematic background drift:
position: [{frame:0, x:960, y:540}, {frame:300, x:980, y:520, easing:"bezier"}]
scale: [{frame:0, x:110, y:110}, {frame:300, x:105, y:105, easing:"bezier"}]

Create EXACTLY what the user describes. Make it CINEMATIC, PREMIUM, and BREATHTAKING.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 16384,
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

        const textBlock = message.content?.find((block: { type: string }) => block.type === "text");
        if (!textBlock) {
            return NextResponse.json({ error: "AI не вернул текст" }, { status: 500 });
        }

        // Robust JSON extraction
        let rawText: string = textBlock.text.trim();
        rawText = rawText
            .replace(/^```(?:json)?\s*\n?/i, "")
            .replace(/\n?```\s*$/i, "")
            .trim();

        // Find the JSON object (starts with { for the new format)
        const objStart = rawText.indexOf("{");
        const objEnd = rawText.lastIndexOf("}");

        if (objStart === -1 || objEnd === -1 || objEnd <= objStart) {
            // Fallback: try array format for backward compatibility
            const arrStart = rawText.indexOf("[");
            const arrEnd = rawText.lastIndexOf("]");
            if (arrStart !== -1 && arrEnd > arrStart) {
                const arrJson = rawText.slice(arrStart, arrEnd + 1);
                try {
                    const scenes = JSON.parse(arrJson);
                    return NextResponse.json({ scenes, format: "legacy" });
                } catch {
                    return NextResponse.json(
                        { error: "AI вернул невалидный JSON", raw: arrJson.slice(0, 300) },
                        { status: 500 }
                    );
                }
            }
            return NextResponse.json(
                { error: "AI не вернул JSON", raw: rawText.slice(0, 300) },
                { status: 500 }
            );
        }

        const jsonString = rawText.slice(objStart, objEnd + 1);

        let result;
        try {
            result = JSON.parse(jsonString);
        } catch {
            return NextResponse.json(
                { error: "AI вернул невалидный JSON", raw: jsonString.slice(0, 300) },
                { status: 500 }
            );
        }

        return NextResponse.json({
            composition: result.composition,
            layers: result.layers,
            format: "v2",
            usage: message.usage,
        });
    } catch (error) {
        console.error("[GENERATE_POST]", error);
        const message = error instanceof Error ? error.message : "Неизвестная ошибка";
        return NextResponse.json({ error: `Ошибка генерации: ${message}` }, { status: 500 });
    }
}
