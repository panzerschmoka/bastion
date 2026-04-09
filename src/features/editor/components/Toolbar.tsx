"use client";

import { 
    MousePointer2, 
    Hand, 
    Type, 
    Square, 
    Circle,
    Image as ImageIcon,
    ZoomIn,
    Video,
    Triangle,
    Wand2,
    Sparkles
} from "lucide-react";
import { useToolStore } from "@/stores/toolStore";
import { useCompositionStore } from "@/stores/compositionStore";
import { useLayerStore } from "@/stores/layerStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useRef } from "react";

export function Toolbar() {
    const activeTool = useToolStore(s => s.activeTool);
    const setTool = useToolStore(s => s.setTool);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const addTextLayer = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "text", "Text Layer", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: { content: "New Text", fontSize: 48, fontWeight: "bold", color: "#ffffff", fontFamily: "Inter" },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
        setTool("selection");
    };

    const addShapeLayer = (shapeType: "rectangle" | "ellipse" | "triangle" = "rectangle") => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "shape", `Shape: ${shapeType}`, {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: { fill: "#6366f1", width: 200, height: 200, borderRadius: shapeType === "rectangle" ? 8 : 0, shapeType },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
        setTool("selection");
    };

    const addSolidLayer = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "solid", "Solid", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: { color: "#333333", width: 1920, height: 1080 },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };
    const addGradientLayer = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "gradient", "Gradient", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: {
                gradientType: "linear",
                angle: 90,
                width: 1920,
                height: 1080,
                colors: [{ color: "#6366f1", stop: 0 }, { color: "#ec4899", stop: 100 }],
            },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };

    const addParticleLayer = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "particle", "Particle System", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: {
                count: 80,
                size: 6,
                sizeVariance: 0.4,
                speed: 2,
                color: "#6366f1",
                colorEnd: "#ec4899",
                shape: "circle",
                spawnX: 0.5,
                spawnY: 0.7,
                spread: 360,
                gravity: 0.02,
                life: 60,
                opacity: 80,
                blurRadius: 1,
                width: 1920,
                height: 1080,
            },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeCompId) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                const currentTime = useTimelineStore.getState().currentTime;
                const duration = useTimelineStore.getState().duration;
                const layerId = useLayerStore.getState().addLayer(activeCompId, "image", file.name, {
                    inPoint: currentTime,
                    outPoint: Math.min(currentTime + 150, duration),
                    data: { src: dataUrl, width: img.width, height: img.height },
                });
                useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
                useSelectionStore.getState().selectLayer(layerId);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
        
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="flex flex-col items-center py-4 gap-1 text-zinc-400">
            <ToolButton 
                icon={<MousePointer2 size={18} />} 
                label="Selection Tool (V)" 
                isActive={activeTool === "selection"} 
                onClick={() => setTool("selection")}
            />
            <ToolButton 
                icon={<Hand size={18} />} 
                label="Hand Tool (H)" 
                isActive={activeTool === "hand"} 
                onClick={() => setTool("hand")}
            />
            <ToolButton 
                icon={<ZoomIn size={18} />} 
                label="Zoom Tool (Z)" 
                isActive={activeTool === "zoom"} 
                onClick={() => setTool("zoom")}
            />
            
            <div className="w-6 h-px bg-[#333] my-2" />
            
            <ToolButton 
                icon={<Type size={18} />} 
                label="Add Text Layer (T)" 
                isActive={activeTool === "type"} 
                onClick={addTextLayer}
            />
            <ToolButton 
                icon={<Square size={18} />} 
                label="Add Rectangle" 
                isActive={false} 
                onClick={() => addShapeLayer("rectangle")}
            />
            <ToolButton 
                icon={<Circle size={18} />} 
                label="Add Ellipse" 
                isActive={false} 
                onClick={() => addShapeLayer("ellipse")}
            />
            <ToolButton 
                icon={<Triangle size={18} />} 
                label="Add Triangle" 
                isActive={false} 
                onClick={() => addShapeLayer("triangle")}
            />
            
            <div className="w-6 h-px bg-[#333] my-2" />

            {/* Hidden file input for image upload */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
            />

            <ToolButton 
                icon={<ImageIcon size={18} />} 
                label="Add Image Layer" 
                isActive={false} 
                onClick={() => {
                    fileInputRef.current?.click();
                }}
            />
            <ToolButton 
                icon={<Video size={18} />} 
                label="Add Solid Layer" 
                isActive={false} 
                onClick={addSolidLayer}
            />
            <ToolButton 
                icon={<Wand2 size={18} />} 
                label="Add Gradient Layer" 
                isActive={false} 
                onClick={addGradientLayer}
            />
            <ToolButton 
                icon={<Sparkles size={18} />} 
                label="Add Particle System" 
                isActive={false} 
                onClick={addParticleLayer}
            />
        </div>
    );
}

function ToolButton({ icon, label, isActive, onClick }: { 
    icon: React.ReactNode; 
    label: string; 
    isActive?: boolean; 
    onClick?: () => void;
}) {
    return (
        <button 
            className={`p-2 rounded-md transition-colors ${
                isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-[#2a2a2a] hover:text-white"
            }`}
            title={label}
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
