import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";

// GET /api/projects/[id] — Получить проект
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: {
                videos: true,
                assets: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
        }
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("[PROJECT_GET]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

// PATCH /api/projects/[id] — Обновить проект
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const existing = await prisma.project.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
        }
        if (existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = updateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Ошибка валидации", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { settings, ...rest } = parsed.data;
        const updated = await prisma.project.update({
            where: { id: params.id },
            data: {
                ...rest,
                ...(settings !== undefined && { settings: JSON.stringify(settings) }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PROJECT_PATCH]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

// DELETE /api/projects/[id] — Удалить проект
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const existing = await prisma.project.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
        }
        if (existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
        }

        await prisma.project.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PROJECT_DELETE]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}
