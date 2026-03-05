import type { User as PrismaUser } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// ── Роли ──
export type UserRole = "USER" | "ADMIN";

// ── Расширение NextAuth типов ──
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
        role: UserRole;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
    }
}

// ── Формы авторизации ──
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

// ── Безопасный тип пользователя (без пароля) ──
export type SafeUser = Omit<PrismaUser, "passwordHash">;
