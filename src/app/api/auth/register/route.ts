import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

// POST /api/auth/register — Регистрация
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Ошибка валидации", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password } = parsed.data;

        // Проверяем, не занят ли email
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Пользователь с таким email уже существует" },
                { status: 409 }
            );
        }

        // Хешируем пароль
        const passwordHash = await hash(password, 12);

        // Создаём пользователя
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("[REGISTER_POST]", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}
