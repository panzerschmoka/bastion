"use client";

import { useCompositionStore } from "@/stores/compositionStore";
import { useLayerStore } from "@/stores/layerStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useKeyframeStore } from "@/stores/keyframeStore";
import { useEffectStore } from "@/stores/effectStore";
import { Layer } from "@/types/layer";
import { Effect } from "@/types/effect";
import { resolveProperty } from "@/lib/interpolation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";

type HandlePosition = 'tl' | 'tr' | 'bl' | 'br' | 'tc' | 'bc' | 'ml' | 'mr' | 'rotate';

interface DragInfo {
    type: 'move' | 'resize' | 'rotate';
    layerId: string;
    startMouseX: number;
    startMouseY: number;
    startPosX: number;
    startPosY: number;
    startScaleX: number;
    startScaleY: number;
    startRotation: number;
    handle?: HandlePosition;
    layerCenterX: number;
    layerCenterY: number;
}

export function Canvas() {
    const compositions = useCompositionStore(s => s.compositions);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const activeComp = compositions.find(c => c.id === activeCompId);
    
    const allLayers = useLayerStore(s => s.layers);
    const updateLayer = useLayerStore(s => s.updateLayer);
    const selectedLayerIds = useSelectionStore(s => s.selectedLayerIds);
    const selectLayer = useSelectionStore(s => s.selectLayer);
    const currentTime = useTimelineStore(s => s.currentTime);
    const addOrUpdateKeyframe = useKeyframeStore(s => s.addOrUpdateKeyframe);
    const allEffects = useEffectStore(s => s.effects);
    
    const [viewportZoom, setViewportZoom] = useState(0.5);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
    const [snapGuides, setSnapGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

    const SNAP_THRESHOLD = 5; // pixels in comp space

    // Panning state
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const panOffsetStart = useRef({ x: 0, y: 0 });
    
    const layers = useMemo(() => {
        if (!activeComp) return [];
        return activeComp.layers
            .map(id => allLayers[id])
            .filter((l): l is Layer => !!l && l.visible && currentTime >= l.inPoint && currentTime < l.outPoint);
    }, [activeComp, allLayers, currentTime]);
    
    const compWidth = activeComp?.width || 1920;
    const compHeight = activeComp?.height || 1080;
    
    // Handle scroll to zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setViewportZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
        }
    }, []);

    // Canvas mouse down — start pan if alt+click or middle click
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY };
            panOffsetStart.current = { ...panOffset };
            e.preventDefault();
        }
    }, [panOffset]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        // Pan
        if (isPanning) {
            setPanOffset({
                x: panOffsetStart.current.x + (e.clientX - panStart.current.x),
                y: panOffsetStart.current.y + (e.clientY - panStart.current.y),
            });
            return;
        }

        // Drag operations
        if (dragInfo) {
            const dx = (e.clientX - dragInfo.startMouseX) / viewportZoom;
            const dy = (e.clientY - dragInfo.startMouseY) / viewportZoom;

            if (dragInfo.type === 'move') {
                let newX = dragInfo.startPosX + dx;
                let newY = dragInfo.startPosY + dy;
                const layer = allLayers[dragInfo.layerId];
                if (!layer) return;

                // ── Snapping logic ──
                const guideX: number[] = [];
                const guideY: number[] = [];
                
                // Snap targets: composition edges + center
                const snapTargetsX = [0, compWidth / 2, compWidth];
                const snapTargetsY = [0, compHeight / 2, compHeight];

                // Add other layers' positions as snap targets
                for (const l of layers) {
                    if (l.id === dragInfo.layerId) continue;
                    const lPos = resolveProperty(l.transform.position, currentTime);
                    snapTargetsX.push(lPos.x);
                    snapTargetsY.push(lPos.y);
                }

                // Snap X
                for (const t of snapTargetsX) {
                    if (Math.abs(newX - t) < SNAP_THRESHOLD) {
                        newX = t;
                        guideX.push(t);
                        break;
                    }
                }
                // Snap Y
                for (const t of snapTargetsY) {
                    if (Math.abs(newY - t) < SNAP_THRESHOLD) {
                        newY = t;
                        guideY.push(t);
                        break;
                    }
                }

                setSnapGuides({ x: guideX, y: guideY });

                // Write keyframe if animated, otherwise update static value
                if (layer.transform.position.isAnimated) {
                    addOrUpdateKeyframe(dragInfo.layerId, 'transform.position', currentTime, { x: Math.round(newX), y: Math.round(newY) }, 'easeOut');
                } else {
                    updateLayer(dragInfo.layerId, {
                        transform: {
                            ...layer.transform,
                            position: { ...layer.transform.position, value: { x: Math.round(newX), y: Math.round(newY) } },
                        },
                    });
                }
            } else if (dragInfo.type === 'resize') {
                let scaleX = dragInfo.startScaleX;
                let scaleY = dragInfo.startScaleY;
                const sensitivity = 0.5;

                switch (dragInfo.handle) {
                    case 'br': scaleX += dx * sensitivity; scaleY += dy * sensitivity; break;
                    case 'bl': scaleX -= dx * sensitivity; scaleY += dy * sensitivity; break;
                    case 'tr': scaleX += dx * sensitivity; scaleY -= dy * sensitivity; break;
                    case 'tl': scaleX -= dx * sensitivity; scaleY -= dy * sensitivity; break;
                    case 'mr': scaleX += dx * sensitivity; break;
                    case 'ml': scaleX -= dx * sensitivity; break;
                    case 'tc': scaleY -= dy * sensitivity; break;
                    case 'bc': scaleY += dy * sensitivity; break;
                }

                scaleX = Math.max(5, Math.round(scaleX));
                scaleY = Math.max(5, Math.round(scaleY));

                // If Shift key — constrain proportions
                if (e.shiftKey && ['tl', 'tr', 'bl', 'br'].includes(dragInfo.handle || '')) {
                    const avg = (scaleX + scaleY) / 2;
                    scaleX = avg;
                    scaleY = avg;
                }

                const layer = allLayers[dragInfo.layerId];
                if (!layer) return;

                if (layer.transform.scale.isAnimated) {
                    addOrUpdateKeyframe(dragInfo.layerId, 'transform.scale', currentTime, { x: scaleX, y: scaleY }, 'easeOut');
                } else {
                    updateLayer(dragInfo.layerId, {
                        transform: {
                            ...layer.transform,
                            scale: { ...layer.transform.scale, value: { x: scaleX, y: scaleY } },
                        },
                    });
                }
            } else if (dragInfo.type === 'rotate') {
                // Calculate angle from center of layer to mouse
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const cx = (dragInfo.layerCenterX * viewportZoom) + rect.left + panOffset.x;
                const cy = (dragInfo.layerCenterY * viewportZoom) + rect.top + panOffset.y;
                
                const startAngle = Math.atan2(
                    dragInfo.startMouseY - cy,
                    dragInfo.startMouseX - cx
                );
                const currentAngle = Math.atan2(
                    e.clientY - cy,
                    e.clientX - cx
                );
                const deltaAngle = ((currentAngle - startAngle) * 180) / Math.PI;
                let newRotation = dragInfo.startRotation + deltaAngle;

                // Snap to 15° increments with Shift
                if (e.shiftKey) {
                    newRotation = Math.round(newRotation / 15) * 15;
                }

                const layer = allLayers[dragInfo.layerId];
                if (!layer) return;

                if (layer.transform.rotation.isAnimated) {
                    addOrUpdateKeyframe(dragInfo.layerId, 'transform.rotation', currentTime, Math.round(newRotation), 'easeOut');
                } else {
                    updateLayer(dragInfo.layerId, {
                        transform: {
                            ...layer.transform,
                            rotation: { ...layer.transform.rotation, value: Math.round(newRotation) },
                        },
                    });
                }
            }
        }
    }, [isPanning, dragInfo, viewportZoom, updateLayer, allLayers, addOrUpdateKeyframe, currentTime, panOffset]);

    const handleCanvasMouseUp = useCallback(() => {
        setIsPanning(false);
        setDragInfo(null);
        setSnapGuides({ x: [], y: [] });
    }, []);

    // Layer mouse down — start move drag
    const handleLayerMouseDown = useCallback((e: React.MouseEvent, layer: Layer) => {
        if (layer.locked) return;
        e.stopPropagation();
        
        selectLayer(layer.id, e.shiftKey || e.ctrlKey);
        
        const pos = resolveProperty(layer.transform.position, currentTime);
        const scale = resolveProperty(layer.transform.scale, currentTime);
        const rotation = resolveProperty(layer.transform.rotation, currentTime);

        setDragInfo({
            type: 'move',
            layerId: layer.id,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPosX: pos.x,
            startPosY: pos.y,
            startScaleX: scale.x,
            startScaleY: scale.y,
            startRotation: rotation,
            layerCenterX: pos.x,
            layerCenterY: pos.y,
        });
    }, [selectLayer, currentTime]);

    // Resize handle mouse down
    const handleResizeMouseDown = useCallback((e: React.MouseEvent, layer: Layer, handle: HandlePosition) => {
        e.stopPropagation();
        e.preventDefault();

        const pos = resolveProperty(layer.transform.position, currentTime);
        const scale = resolveProperty(layer.transform.scale, currentTime);
        const rotation = resolveProperty(layer.transform.rotation, currentTime);

        setDragInfo({
            type: handle === 'rotate' ? 'rotate' : 'resize',
            layerId: layer.id,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPosX: pos.x,
            startPosY: pos.y,
            startScaleX: scale.x,
            startScaleY: scale.y,
            startRotation: rotation,
            handle,
            layerCenterX: pos.x,
            layerCenterY: pos.y,
        });
    }, [currentTime]);

    // Cursor for each handle
    const handleCursor = (h: HandlePosition): string => {
        switch (h) {
            case 'tl': case 'br': return 'nwse-resize';
            case 'tr': case 'bl': return 'nesw-resize';
            case 'tc': case 'bc': return 'ns-resize';
            case 'ml': case 'mr': return 'ew-resize';
            case 'rotate': return 'crosshair';
            default: return 'default';
        }
    };

    if (!activeComp) {
        return (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                No composition selected
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full flex items-center justify-center overflow-hidden relative"
            style={{ cursor: isPanning ? "grabbing" : dragInfo?.type === 'move' ? "move" : "default" }}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={(e) => { if (!dragInfo) selectLayer(null); }}
        >
            {/* Zoom indicator */}
            <div className="absolute top-3 right-3 z-20 text-[10px] text-zinc-500 bg-[#111]/80 px-2 py-1 rounded">
                {Math.round(viewportZoom * 100)}%
            </div>
            
            {/* Composition Canvas */}
            <div 
                className="relative shadow-2xl"
                style={{
                    width: compWidth * viewportZoom,
                    height: compHeight * viewportZoom,
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                    perspective: 1200 * viewportZoom,
                    overflow: 'hidden',
                }}
            >
                {/* Checkerboard transparency background */}
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
                            linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
                            linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
                        `,
                        backgroundSize: `${20 * viewportZoom}px ${20 * viewportZoom}px`,
                        backgroundPosition: `0 0, 0 ${10 * viewportZoom}px, ${10 * viewportZoom}px -${10 * viewportZoom}px, -${10 * viewportZoom}px 0px`,
                        backgroundColor: '#141414',
                    }}
                />
                
                {/* Composition background */}
                <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: activeComp.backgroundColor }}
                />
                
                {/* Render Layers */}
                {layers.map((layer) => {
                    const isSelected = selectedLayerIds.includes(layer.id);
                    const pos = resolveProperty(layer.transform.position, currentTime);
                    const scale = resolveProperty(layer.transform.scale, currentTime);
                    const rotation = resolveProperty(layer.transform.rotation, currentTime);
                    const opacity = resolveProperty(layer.transform.opacity, currentTime);
                    const anchor = resolveProperty(layer.transform.anchorPoint, currentTime);
                    
                    // Compute CSS filter from effects
                    const layerEffects = layer.effects
                        .map(eid => allEffects[eid])
                        .filter((e): e is Effect => !!e && e.enabled);
                    
                    const filterParts: string[] = [];
                    let boxShadow = '';
                    
                    for (const eff of layerEffects) {
                        const p = eff.properties;
                        switch (eff.type) {
                            case 'gaussianBlur': {
                                const r = (p.radius ?? 0) * viewportZoom;
                                filterParts.push(`blur(${r}px)`);
                                break;
                            }
                            case 'glow': {
                                const r = (p.radius ?? 10) * viewportZoom;
                                const intensity = (p.intensity ?? 50) / 100;
                                const c = p.color ?? '#6366f1';
                                boxShadow = `0 0 ${r}px ${r * 0.5}px ${c}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
                                break;
                            }
                            case 'dropShadow': {
                                const ox = (p.offsetX ?? 4) * viewportZoom;
                                const oy = (p.offsetY ?? 4) * viewportZoom;
                                const bl = (p.blur ?? 8) * viewportZoom;
                                const c = p.color ?? '#000000';
                                const op = (p.opacity ?? 60) / 100;
                                filterParts.push(`drop-shadow(${ox}px ${oy}px ${bl}px ${c}${Math.round(op * 255).toString(16).padStart(2, '0')})`);
                                break;
                            }
                            case 'colorCorrection': {
                                const br = 100 + (p.brightness ?? 0);
                                const co = 100 + (p.contrast ?? 0);
                                const sa = p.saturation ?? 100;
                                const hr = p.hueRotate ?? 0;
                                filterParts.push(`brightness(${br}%) contrast(${co}%) saturate(${sa}%) hue-rotate(${hr}deg)`);
                                break;
                            }
                            case 'vignette': {
                                // Vignette is handled as a pseudo-overlay, we skip CSS filter for it
                                break;
                            }
                        }
                    }

                    const cssFilter = filterParts.length > 0 ? filterParts.join(' ') : undefined;
                    const hasVignette = layerEffects.find(e => e.type === 'vignette');

                    // Compute z-index from layer position in composition array
                    const layerIndex = layers.indexOf(layer);

                    // Map AE blend modes to CSS mix-blend-mode
                    const blendModeMap: Record<string, string> = {
                        normal: 'normal', multiply: 'multiply', screen: 'screen',
                        overlay: 'overlay', darken: 'darken', lighten: 'lighten',
                        colorDodge: 'color-dodge', colorBurn: 'color-burn',
                        hardLight: 'hard-light', softLight: 'soft-light',
                        difference: 'difference', exclusion: 'exclusion',
                        hue: 'hue', saturation: 'saturation', color: 'color',
                        luminosity: 'luminosity', add: 'screen',
                    };
                    const cssBlendMode = blendModeMap[layer.blendMode] || 'normal';

                    return (
                        <div
                            key={layer.id}
                            className={`absolute ${layer.locked ? 'pointer-events-none' : 'cursor-move'}`}
                            style={{
                                left: pos.x * viewportZoom,
                                top: pos.y * viewportZoom,
                                transform: `translate(-${anchor.x * viewportZoom}px, -${anchor.y * viewportZoom}px) rotate(${rotation}deg) scale(${scale.x / 100}, ${scale.y / 100})`,
                                opacity: opacity / 100,
                                zIndex: layerIndex,
                                filter: cssFilter,
                                boxShadow: boxShadow || undefined,
                                mixBlendMode: cssBlendMode as any,
                                willChange: 'transform, opacity',
                            }}
                            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
                        >
                            {/* Render by layer type */}
                            {layer.type === 'text' && <TextLayerRenderer data={layer.data} zoom={viewportZoom} />}
                            {layer.type === 'solid' && <SolidLayerRenderer data={layer.data} zoom={viewportZoom} />}
                            {layer.type === 'shape' && <ShapeLayerRenderer data={layer.data} zoom={viewportZoom} />}
                            {layer.type === 'image' && <ImageLayerRenderer data={layer.data} zoom={viewportZoom} />}
                            {layer.type === 'gradient' && <GradientLayerRenderer data={layer.data} zoom={viewportZoom} />}
                            {layer.type === 'particle' && <ParticleLayerRenderer data={layer.data} zoom={viewportZoom} currentTime={currentTime} layerInPoint={layer.inPoint} />}
                            
                            {/* Selection & handles */}
                            {isSelected && !layer.locked && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Selection border */}
                                    <div className="absolute inset-0 border-2 border-accent" />
                                    
                                    {/* Corner resize handles */}
                                    {(['tl', 'tr', 'bl', 'br', 'tc', 'bc', 'ml', 'mr'] as HandlePosition[]).map(h => {
                                        const posStyles: Record<string, string> = {
                                            tl: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
                                            tr: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
                                            bl: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
                                            br: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
                                            tc: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                            bc: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
                                            ml: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
                                            mr: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
                                        };
                                        const isCorner = ['tl', 'tr', 'bl', 'br'].includes(h);
                                        return (
                                            <div
                                                key={h}
                                                className={`absolute ${posStyles[h]} pointer-events-auto ${isCorner ? 'w-2.5 h-2.5' : 'w-2 h-2'} bg-white border border-accent rounded-[1px] hover:bg-accent transition-colors`}
                                                style={{ cursor: handleCursor(h) }}
                                                onMouseDown={(e) => handleResizeMouseDown(e, layer, h)}
                                            />
                                        );
                                    })}

                                    {/* Rotation handle (above the element) */}
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
                                        style={{ top: -30 }}
                                    >
                                        <div className="w-px h-4 bg-accent mx-auto" />
                                        <div
                                            className="w-3 h-3 rounded-full bg-white border-2 border-accent hover:bg-accent transition-colors -translate-x-0"
                                            style={{ cursor: 'crosshair' }}
                                            onMouseDown={(e) => handleResizeMouseDown(e, layer, 'rotate')}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Safe area guides */}
                <div className="absolute inset-0 pointer-events-none" style={{ padding: `${compHeight * 0.05 * viewportZoom}px ${compWidth * 0.05 * viewportZoom}px` }}>
                    <div className="w-full h-full border border-dashed border-white/5" />
                </div>

                {/* Snap Guide Lines */}
                {snapGuides.x.map((x, i) => (
                    <div
                        key={`snap-x-${i}`}
                        className="absolute top-0 bottom-0 pointer-events-none z-40"
                        style={{
                            left: x * viewportZoom,
                            width: 1,
                            background: 'cyan',
                            opacity: 0.6,
                            boxShadow: '0 0 4px cyan',
                        }}
                    />
                ))}
                {snapGuides.y.map((y, i) => (
                    <div
                        key={`snap-y-${i}`}
                        className="absolute left-0 right-0 pointer-events-none z-40"
                        style={{
                            top: y * viewportZoom,
                            height: 1,
                            background: 'cyan',
                            opacity: 0.6,
                            boxShadow: '0 0 4px cyan',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// Sub-renderers for each layer type — resilient to AI-generated data shapes

function TextLayerRenderer({ data, zoom }: { data: any; zoom: number }) {
    const content = data?.content || "Text";
    const fontSize = (data?.fontSize || data?.style?.fontSize || 48) * zoom;
    const fontFamily = data?.fontFamily || data?.style?.fontFamily || "Inter, sans-serif";
    const fontWeight = data?.fontWeight || data?.style?.fontWeight || "700";
    const color = data?.color || data?.style?.color || "#ffffff";
    const letterSpacing = (data?.letterSpacing || 0) * zoom;
    const textStroke = data?.stroke || data?.textStroke;
    const textGlow = data?.glow || data?.textGlow;

    // Build rich text shadow for premium feel
    const shadows: string[] = ["0 2px 8px rgba(0,0,0,0.5)"];
    if (textGlow) {
        const glowColor = typeof textGlow === 'string' ? textGlow : (textGlow.color || color);
        const glowRadius = (typeof textGlow === 'object' ? textGlow.radius : 20) * zoom;
        shadows.push(`0 0 ${glowRadius}px ${glowColor}40`);
        shadows.push(`0 0 ${glowRadius * 2}px ${glowColor}20`);
    }

    return (
        <div
            style={{
                fontSize,
                fontFamily,
                fontWeight,
                color,
                textAlign: data?.textAlign || "center",
                lineHeight: data?.lineHeight || 1.2,
                letterSpacing,
                whiteSpace: "pre-wrap",
                textShadow: shadows.join(', '),
                textTransform: data?.textTransform || 'none',
                WebkitTextStroke: textStroke ? `${(textStroke.width || 1) * zoom}px ${textStroke.color || '#ffffff40'}` : undefined,
            }}
        >
            {content}
        </div>
    );
}

function SolidLayerRenderer({ data, zoom }: { data: any; zoom: number }) {
    const w = data?.width || 1920;
    const h = data?.height || 1080;
    return (
        <div
            style={{
                width: w * zoom,
                height: h * zoom,
                backgroundColor: data?.color || "#000000",
            }}
        />
    );
}

function ShapeLayerRenderer({ data, zoom }: { data: any; zoom: number }) {
    const w = (data?.width || 200) * zoom;
    const h = (data?.height || 200) * zoom;
    const fill = data?.fill || "#6366f1";
    const br = (data?.borderRadius || 0) * zoom;
    const isEllipse = data?.shapeType === "ellipse";
    const isTriangle = data?.shapeType === "triangle";
    const shapeGlow = data?.glow;

    // Build box shadow for glow effect
    let shapeShadow = '';
    if (shapeGlow) {
        const glowColor = typeof shapeGlow === 'string' ? shapeGlow : (shapeGlow.color || fill);
        const glowRadius = (typeof shapeGlow === 'object' ? shapeGlow.radius : 15) * zoom;
        shapeShadow = `0 0 ${glowRadius}px ${glowColor}60, 0 0 ${glowRadius * 2}px ${glowColor}30`;
    }

    if (isTriangle) {
        return (
            <div style={{ width: w, height: h, filter: shapeGlow ? `drop-shadow(0 0 ${8 * zoom}px ${fill}60)` : undefined }}>
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                    <polygon
                        points={`${w/2},0 ${w},${h} 0,${h}`}
                        fill={fill}
                        stroke={data?.stroke || "none"}
                        strokeWidth={data?.strokeWidth ? data.strokeWidth * zoom : 0}
                    />
                </svg>
            </div>
        );
    }

    return (
        <div
            style={{
                width: w,
                height: h,
                backgroundColor: fill,
                borderRadius: isEllipse ? "50%" : br,
                border: data?.strokeWidth ? `${data.strokeWidth * zoom}px solid ${data.stroke || "#fff"}` : "none",
                boxShadow: shapeShadow || undefined,
            }}
        />
    );
}

function ImageLayerRenderer({ data, zoom }: { data: any; zoom: number }) {
    const src = data?.src;
    if (!src) {
        return (
            <div
                className="flex items-center justify-center text-zinc-500 text-xs bg-zinc-800"
                style={{ width: 300 * zoom, height: 200 * zoom }}
            >
                No image
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={data?.alt || ""}
            className="pointer-events-none"
            draggable={false}
            style={{ maxWidth: 400 * zoom, maxHeight: 400 * zoom }}
        />
    );
}

function GradientLayerRenderer({ data, zoom }: { data: any; zoom: number }) {
    const w = (data?.width || 1920) * zoom;
    const h = (data?.height || 1080) * zoom;
    const type = data?.gradientType || 'linear';
    const angle = data?.angle ?? 90;
    const colors: { color: string; stop: number }[] = data?.colors || [
        { color: '#6366f1', stop: 0 },
        { color: '#ec4899', stop: 100 },
    ];
    const stops = colors.map(c => `${c.color} ${c.stop}%`).join(', ');

    let bg = '';
    if (type === 'linear') bg = `linear-gradient(${angle}deg, ${stops})`;
    else if (type === 'radial') bg = `radial-gradient(circle, ${stops})`;
    else if (type === 'conic') bg = `conic-gradient(from ${angle}deg, ${stops})`;

    return <div style={{ width: w, height: h, background: bg }} />;
}

function ParticleLayerRenderer({ data, zoom, currentTime, layerInPoint }: { data: any; zoom: number; currentTime: number; layerInPoint: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const w = (data?.width || 400) * zoom;
    const h = (data?.height || 400) * zoom;
    // Relative time from layer start
    const localTime = Math.max(0, currentTime - layerInPoint);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const count        = data?.count ?? 60;
        const size         = (data?.size ?? 6) * zoom;
        const sizeVariance = data?.sizeVariance ?? 0.4;
        const speed        = (data?.speed ?? 2) * zoom;
        const color        = data?.color ?? '#6366f1';
        const colorEnd     = data?.colorEnd;
        const shape        = data?.shape ?? 'circle';
        const spawnX       = (data?.spawnX ?? 0.5) * w;
        const spawnY       = (data?.spawnY ?? 0.5) * h;
        const spread       = ((data?.spread ?? 360) * Math.PI) / 180;
        const gravity      = (data?.gravity ?? 0.05) * zoom;
        const life         = data?.life ?? 60;
        const opacity      = (data?.opacity ?? 80) / 100;
        const blurRadius   = (data?.blurRadius ?? 0) * zoom;

        ctx.clearRect(0, 0, w, h);
        ctx.filter = blurRadius > 0 ? `blur(${blurRadius}px)` : 'none';

        // Deterministic particles seeded by index
        for (let i = 0; i < count; i++) {
            const seed = i * 1234.5678;
            const pseudoRand = (n: number) => (((Math.sin(seed + n) * 43758.5453) % 1) + 1) % 1;

            const birthFrame   = Math.floor(pseudoRand(0) * life);
            const age          = ((localTime - birthFrame + life) % life);
            const lifeProgress = age / life;

            // Angle of emission
            const baseAngle = -Math.PI / 2; // upward
            const halfSpread = spread / 2;
            const angle      = baseAngle + (pseudoRand(1) - 0.5) * halfSpread;

            const vel    = speed * (0.5 + pseudoRand(2) * 0.8);
            const dx     = Math.cos(angle) * vel * age;
            const dy     = Math.sin(angle) * vel * age + 0.5 * gravity * age * age;

            const px     = spawnX + dx;
            const py     = spawnY + dy;

            const sz     = size * (1 - sizeVariance * pseudoRand(3)) * (1 - lifeProgress * 0.5);
            const alpha  = opacity * (1 - lifeProgress);

            if (alpha <= 0 || sz <= 0) continue;

            ctx.globalAlpha = alpha;

            // Color interpolation
            if (colorEnd) {
                const r1 = parseInt(color.slice(1, 3), 16);
                const g1 = parseInt(color.slice(3, 5), 16);
                const b1 = parseInt(color.slice(5, 7), 16);
                const r2 = parseInt(colorEnd.slice(1, 3), 16);
                const g2 = parseInt(colorEnd.slice(3, 5), 16);
                const b2 = parseInt(colorEnd.slice(5, 7), 16);
                const r  = Math.round(r1 + (r2 - r1) * lifeProgress);
                const g  = Math.round(g1 + (g2 - g1) * lifeProgress);
                const b  = Math.round(b1 + (b2 - b1) * lifeProgress);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
            } else {
                ctx.fillStyle = color;
            }

            ctx.beginPath();
            if (shape === 'circle') {
                ctx.arc(px, py, sz / 2, 0, Math.PI * 2);
            } else if (shape === 'square') {
                ctx.rect(px - sz / 2, py - sz / 2, sz, sz);
            } else if (shape === 'star') {
                const spikes = 5;
                const outerR = sz / 2;
                const innerR = outerR * 0.4;
                let rot = (-Math.PI / 2);
                ctx.moveTo(px + outerR * Math.cos(rot), py + outerR * Math.sin(rot));
                for (let s = 0; s < spikes; s++) {
                    rot += Math.PI / spikes;
                    ctx.lineTo(px + innerR * Math.cos(rot), py + innerR * Math.sin(rot));
                    rot += Math.PI / spikes;
                    ctx.lineTo(px + outerR * Math.cos(rot), py + outerR * Math.sin(rot));
                }
                ctx.closePath();
            }
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.filter = 'none';
    }, [localTime, w, h, data, zoom]);

    return <canvas ref={canvasRef} width={w} height={h} style={{ display: 'block' }} />;
}
