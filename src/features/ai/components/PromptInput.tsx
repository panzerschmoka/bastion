"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useCompositionStore } from "@/stores/compositionStore";
import { useLayerStore } from "@/stores/layerStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { AnimatedProperty, Keyframe, InterpolationType } from "@/types/keyframe";
import { createAnimatedProperty } from "@/types/keyframe";
import { Transform } from "@/types/layer";
import { nanoid } from "nanoid";

// ─── AI Response Types (v2 format) ───

interface AIComposition {
    name: string;
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames: number;
    backgroundColor: string;
}

interface AIKeyframePos { frame: number; x: number; y: number; easing?: string }
interface AIKeyframeVal { frame: number; value: number; easing?: string }
interface AIKeyframeScale { frame: number; x: number; y: number; easing?: string }

interface AITransform {
    position?: { keyframes: AIKeyframePos[] };
    scale?: { keyframes: AIKeyframeScale[] };
    rotation?: { keyframes: AIKeyframeVal[] };
    opacity?: { keyframes: AIKeyframeVal[] };
}

interface AILayer {
    name: string;
    type: "solid" | "text" | "shape" | "image" | "gradient" | "particle";
    inPoint: number;
    outPoint: number;
    data: Record<string, any>;
    transform?: AITransform;
}

// ─── Keyframe Converters ───

function convertPosKeyframes(kfs: AIKeyframePos[] | undefined, defaultVal: {x: number; y: number}): AnimatedProperty<{x: number; y: number}> {
    if (!kfs || kfs.length === 0) return createAnimatedProperty(defaultVal);
    if (kfs.length === 1) {
        return createAnimatedProperty({ x: kfs[0].x, y: kfs[0].y });
    }
    return {
        isAnimated: true,
        value: { x: kfs[0].x, y: kfs[0].y },
        keyframes: kfs.map(k => ({
            id: nanoid(),
            time: k.frame,
            value: { x: k.x, y: k.y },
            interpolation: (k.easing || "easeOut") as InterpolationType,
        })),
    };
}

function convertScaleKeyframes(kfs: AIKeyframeScale[] | undefined): AnimatedProperty<{x: number; y: number}> {
    const defaultVal = { x: 100, y: 100 };
    if (!kfs || kfs.length === 0) return createAnimatedProperty(defaultVal);
    if (kfs.length === 1) {
        return createAnimatedProperty({ x: kfs[0].x, y: kfs[0].y });
    }
    return {
        isAnimated: true,
        value: { x: kfs[0].x, y: kfs[0].y },
        keyframes: kfs.map(k => ({
            id: nanoid(),
            time: k.frame,
            value: { x: k.x, y: k.y },
            interpolation: (k.easing || "easeOut") as InterpolationType,
        })),
    };
}

function convertValueKeyframes(kfs: AIKeyframeVal[] | undefined, defaultVal: number): AnimatedProperty<number> {
    if (!kfs || kfs.length === 0) return createAnimatedProperty(defaultVal);
    if (kfs.length === 1) {
        return createAnimatedProperty(kfs[0].value);
    }
    return {
        isAnimated: true,
        value: kfs[0].value,
        keyframes: kfs.map(k => ({
            id: nanoid(),
            time: k.frame,
            value: k.value,
            interpolation: (k.easing || "easeOut") as InterpolationType,
        })),
    };
}

function convertAITransform(aiTransform: AITransform | undefined, defaultPos: {x: number; y: number}): Transform {
    if (!aiTransform) {
        return {
            position: createAnimatedProperty(defaultPos),
            scale: createAnimatedProperty({ x: 100, y: 100 }),
            rotation: createAnimatedProperty(0),
            opacity: createAnimatedProperty(100),
            anchorPoint: createAnimatedProperty({ x: 0, y: 0 }),
            skew: createAnimatedProperty(0),
            skewAxis: createAnimatedProperty(0),
        };
    }

    return {
        position: convertPosKeyframes(aiTransform.position?.keyframes, defaultPos),
        scale: convertScaleKeyframes(aiTransform.scale?.keyframes),
        rotation: convertValueKeyframes(aiTransform.rotation?.keyframes, 0),
        opacity: convertValueKeyframes(aiTransform.opacity?.keyframes, 100),
        anchorPoint: createAnimatedProperty({ x: 0, y: 0 }),
        skew: createAnimatedProperty(0),
        skewAxis: createAnimatedProperty(0),
    };
}

// ─── Component ───

export function PromptInput() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        setError(null);

        try {
            // 1. Создаём новый проект
            const projectRes = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: prompt.slice(0, 80) }),
            });

            if (!projectRes.ok) {
                throw new Error("Не удалось создать проект");
            }

            const project = await projectRes.json();

            // 2. Генерируем через AI
            const genRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, projectId: project.id }),
            });

            if (!genRes.ok) {
                const data = await genRes.json();
                throw new Error(data.error || "Ошибка генерации");
            }

            const result = await genRes.json();
            console.log("AI result:", result);

            // 3. Convert AI response to stores
            if (result.format === "v2" && result.composition && result.layers) {
                // ─── V2 Format: Direct keyframe data ───
                const aiComp: AIComposition = result.composition;
                const aiLayers: AILayer[] = result.layers;

                const compId = useCompositionStore.getState().addComposition({
                    name: aiComp.name || prompt.slice(0, 50),
                    width: aiComp.width || 1920,
                    height: aiComp.height || 1080,
                    fps: aiComp.fps || 30,
                    durationInFrames: aiComp.durationInFrames || 150,
                    backgroundColor: aiComp.backgroundColor || "#000000",
                });

                useCompositionStore.getState().setActiveComposition(compId);
                useTimelineStore.getState().setDuration(aiComp.durationInFrames || 150);

                for (const aiLayer of aiLayers) {
                    const transform = convertAITransform(aiLayer.transform, { x: 960, y: 540 });

                    // Ensure full-canvas layers have width/height for rendering
                    const layerData = { ...aiLayer.data };
                    if ((aiLayer.type === "solid" || aiLayer.type === "gradient" || aiLayer.type === "particle") && !layerData.width) {
                        layerData.width = 1920;
                        layerData.height = 1080;
                    }

                    const layerId = useLayerStore.getState().addLayer(
                        compId,
                        aiLayer.type,
                        aiLayer.name || aiLayer.type,
                        {
                            inPoint: aiLayer.inPoint || 0,
                            outPoint: aiLayer.outPoint || aiComp.durationInFrames,
                            data: layerData,
                            transform,
                        }
                    );
                    useCompositionStore.getState()._addLayerToComp(compId, layerId);
                }

                console.log(`✅ V2: Created ${aiLayers.length} layers with direct keyframes`);

            } else if (result.scenes) {
                // ─── Legacy Format: Scene array (backward compat) ───
                const scenes = result.scenes;
                const totalFrames = scenes.reduce((sum: number, s: any) => sum + (s.durationInFrames || 150), 0);
                
                const compId = useCompositionStore.getState().addComposition({
                    name: prompt.slice(0, 50),
                    width: 1920, height: 1080, fps: 30,
                    durationInFrames: totalFrames,
                    backgroundColor: scenes[0]?.backgroundColor || "#000000",
                });

                useCompositionStore.getState().setActiveComposition(compId);
                useTimelineStore.getState().setDuration(totalFrames);

                let frameOffset = 0;
                for (const scene of scenes) {
                    const dur = scene.durationInFrames || 150;
                    for (const el of (scene.elements || [])) {
                        const inPoint = frameOffset + (el.from || 0);
                        const outPoint = inPoint + (el.durationInFrames || dur);
                        const layerId = useLayerStore.getState().addLayer(compId, el.type?.toLowerCase() || "shape", el.type || "Element", {
                            inPoint, outPoint, data: el,
                        });
                        useCompositionStore.getState()._addLayerToComp(compId, layerId);
                    }
                    frameOffset += dur;
                }
            }

            // 4. Переходим в редактор
            router.push(`/editor/${project.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-background border rounded-xl overflow-hidden shadow-lg transition-all focus-within:ring-2 focus-within:ring-accent/50">
            <div className="p-3">
                <Textarea 
                    placeholder="Опишите анимацию (например: 'Красный круг плавно двигается слева направо за 3 секунды на чёрном фоне')"
                    className="min-h-[100px] border-0 focus-visible:ring-0 resize-none p-0 bg-transparent text-base"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleGenerate();
                        }
                    }}
                />
            </div>

            {error && (
                <div className="mx-3 mb-2 flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}
            
            <div className="bg-muted/30 p-3 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                    {isGenerating ? "AI генерирует анимацию..." : "Ctrl+Enter для быстрой генерации"}
                </span>
                <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-accent hover:bg-accent/90 text-white gap-2 shadow-md shadow-accent/20 rounded-lg px-6"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Генерация...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Сгенерировать
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
