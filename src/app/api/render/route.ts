import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/render — Запустить рендер проекта (заглушка)
// В будущем: интегрируем @remotion/renderer для серверного рендера
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const { projectId } = await req.json();
        if (!projectId) {
            return NextResponse.json({ error: "projectId обязателен" }, { status: 400 });
        }

        // Проверяем, что проект принадлежит юзеру
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
        }
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
        }

        // Обновляем статус проекта
        await prisma.project.update({
            where: { id: projectId },
            data: { status: "RENDERING" },
        });

        // TODO: Интеграция с @remotion/renderer
        // Здесь будет запуск рендера в фоне через queue (BullMQ/Inngest)
        // Пока возвращаем mock-ответ

        // Имитация завершения рендера через 3 секунды
        setTimeout(async () => {
            try {
                await prisma.project.update({
                    where: { id: projectId },
                    data: {
                        status: "COMPLETED",
                    },
                });
            } catch (e) {
                console.error("[RENDER_COMPLETE]", e);
            }
        }, 3000);

        return NextResponse.json({
            status: "RENDERING",
            message: "Рендер запущен. Проверьте статус проекта через несколько секунд.",
            projectId,
        });
    } catch (error) {
        console.error("[RENDER_POST]", error);
        return NextResponse.json({ error: "Ошибка рендера" }, { status: 500 });
    }
}
