import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    text?: string;
}

export function LoadingSpinner({
    className,
    size = 24,
    text,
}: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <Loader2 
                className="animate-spin text-primary" 
                size={size} 
            />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
        </div>
    );
}

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingSpinner size={48} text="Загрузка MotionAI..." />
        </div>
    );
}
