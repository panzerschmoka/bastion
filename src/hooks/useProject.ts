import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ProjectWithRelations, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import type { PaginatedResponse } from "@/types/api";

interface UseProjectReturn {
    projects: ProjectWithRelations[];
    isLoading: boolean;
    error: string | null;
    fetchProjects: (page?: number) => Promise<void>;
    createProject: (data: CreateProjectInput) => Promise<ProjectWithRelations | null>;
    updateProject: (id: string, data: UpdateProjectInput) => Promise<boolean>;
    deleteProject: (id: string) => Promise<boolean>;
}

export function useProject(): UseProjectReturn {
    const { data: session } = useSession();
    const router = useRouter();

    const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/projects?page=${page}&limit=20`);
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.message ?? "Ошибка загрузки проектов");
            }
            const data: PaginatedResponse<ProjectWithRelations> = await res.json();
            setProjects(data.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createProject = useCallback(
        async (data: CreateProjectInput): Promise<ProjectWithRelations | null> => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.message ?? "Ошибка создания проекта");
                }
                const project: ProjectWithRelations = await res.json();
                setProjects((prev) => [project, ...prev]);
                router.push(`/editor/${project.id}`);
                return project;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [router]
    );

    const updateProject = useCallback(
        async (id: string, data: UpdateProjectInput): Promise<boolean> => {
            setError(null);
            try {
                const res = await fetch(`/api/projects/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.message ?? "Ошибка обновления проекта");
                }
                const updated: ProjectWithRelations = await res.json();
                setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
                return false;
            }
        },
        []
    );

    const deleteProject = useCallback(async (id: string): Promise<boolean> => {
        setError(null);
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.message ?? "Ошибка удаления проекта");
            }
            setProjects((prev) => prev.filter((p) => p.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            return false;
        }
    }, []);

    return {
        projects,
        isLoading,
        error,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
    };
}
