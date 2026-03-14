import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import type { LoginCredentials, RegisterData, SafeUser } from "@/types/auth";

interface UseAuthReturn {
    user: Pick<SafeUser, "id" | "email" | "name" | "image" | "role"> | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    const user: Pick<SafeUser, "id" | "email" | "name" | "image" | "role"> | null = session?.user
        ? {
              id: session.user.id as string,
              email: session.user.email ?? "",
              name: session.user.name ?? null,
              image: session.user.image ?? null,
              role: (session.user as { role?: string }).role as SafeUser["role"] ?? "USER",
          }
        : null;

    const login = useCallback(
        async (credentials: LoginCredentials): Promise<boolean> => {
            setError(null);
            try {
                const result = await signIn("credentials", {
                    ...credentials,
                    redirect: false,
                });
                if (result?.error) {
                    setError("Неверный email или пароль");
                    return false;
                }
                router.push("/dashboard");
                router.refresh();
                return true;
            } catch {
                setError("Произошла ошибка при входе");
                return false;
            }
        },
        [router]
    );

    const register = useCallback(
        async (data: RegisterData): Promise<boolean> => {
            setError(null);
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const body = await res.json();
                    setError(body.message ?? "Ошибка регистрации");
                    return false;
                }
                // После успешной регистрации — автовход
                return await login({ email: data.email, password: data.password });
            } catch {
                setError("Произошла ошибка при регистрации");
                return false;
            }
        },
        [login]
    );

    const logout = useCallback(async () => {
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
    }, [router]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
    };
}
