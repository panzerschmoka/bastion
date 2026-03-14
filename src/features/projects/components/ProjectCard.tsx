"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit2, Play, Trash2 } from "lucide-react";

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        status: string;
        updatedAt: Date;
        thumbnail?: string | null;
    };
    onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
    const isCompleted = project.status === "COMPLETED";
    
    return (
        <Card className="overflow-hidden group flex flex-col transition-all hover:shadow-md hover:border-primary/30">
            <div className="relative aspect-video bg-zinc-900 overflow-hidden flex items-center justify-center">
                {project.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={project.thumbnail} 
                        alt={project.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 group-hover:bg-zinc-800/80 transition-colors">
                        <Play className="h-12 w-12 opacity-20" />
                    </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={isCompleted ? "default" : "secondary"} className="shadow-sm">
                        {isCompleted ? "Готово" : "Черновик"}
                    </Badge>
                </div>
                
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 backdrop-blur-[2px]">
                    <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 flex" asChild>
                        <Link href={`/editor/${project.id}`}>
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    </Button>
                    {onDelete && (
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="rounded-full h-10 w-10 flex"
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete(project.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                        Обновлено {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ru })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
