"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";

type GenerationStep = {
    label: string;
    status: "pending" | "running" | "done" | "error";
};

interface GenerationStatusProps {
    steps: GenerationStep[];
    progress: number;
    error?: string | null;
}

export function GenerationStatus({ steps, progress, error }: GenerationStatusProps) {
    const getIcon = (status: GenerationStep["status"]) => {
        switch (status) {
            case "done":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "running":
                return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
        }
    };

    return (
        <Card className="border-accent/20 shadow-lg shadow-accent/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-5 w-5 text-accent" />
                    AI Генерация
                    <Badge variant="secondary" className="ml-auto">
                        {Math.round(progress)}%
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />

                <div className="space-y-3">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            {getIcon(step.status)}
                            <span className={`text-sm ${
                                step.status === "running" 
                                    ? "text-foreground font-medium" 
                                    : step.status === "done" 
                                        ? "text-muted-foreground line-through" 
                                        : "text-muted-foreground"
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
