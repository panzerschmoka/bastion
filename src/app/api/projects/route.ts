import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";

// GET /api/projects — Список проектов текущего пользователя
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const skip = (page - 1) * limit;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where: { userId: session.user.id },
                orderBy: { updatedAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.project.count({ where: { userId: session.user.id } }),
        ]);

        return NextResponse.json({
            items: projects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("[PROJECTS_GET]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

// POST /api/projects — Создание нового проекта
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Ошибка валидации", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                title: parsed.data.title,
                description: parsed.data.description || null,
                userId: session.user.id,
                settings: JSON.stringify(parsed.data.settings || {
                    width: 1920,
                    height: 1080,
                    fps: 30,
                }),
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("[PROJECTS_POST]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

