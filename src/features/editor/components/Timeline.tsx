"use client";

import { useCompositionStore } from "@/stores/compositionStore";
import { useLayerStore } from "@/stores/layerStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { Layer } from "@/types/layer";
import { 
    Eye, 
    EyeOff, 
    Lock, 
    Unlock, 
    ChevronRight,
    ChevronDown,
    Play, 
    Pause, 
    SkipBack,
    SkipForward,
    Plus,
    Scissors,
    Diamond
} from "lucide-react";
import { useCallback, useRef, useEffect, useMemo, useState } from "react";

type DragType = 'playhead' | 'layer-in' | 'layer-out' | 'layer-move' | 'workarea-in' | 'workarea-out' | null;

// ─── Property row config ───
const PROP_ROWS = [
    { key: 'position',  label: 'Position',  color: '#ef4444' },
    { key: 'scale',     label: 'Scale',     color: '#22c55e' },
    { key: 'rotation',  label: 'Rotation',  color: '#3b82f6' },
    { key: 'opacity',   label: 'Opacity',   color: '#eab308' },
] as const;

export function Timeline() {
    const compositions = useCompositionStore(s => s.compositions);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const activeComp = compositions.find(c => c.id === activeCompId);
    
    const allLayers = useLayerStore(s => s.layers);
    const toggleVisibility = useLayerStore(s => s.toggleVisibility);
    const toggleLock = useLayerStore(s => s.toggleLock);
    const updateLayer = useLayerStore(s => s.updateLayer);
    
    const selectedLayerIds = useSelectionStore(s => s.selectedLayerIds);
    const selectLayer = useSelectionStore(s => s.selectLayer);
    const selectedKeyframeIds = useSelectionStore(s => s.selectedKeyframeIds);
    const selectKeyframe = useSelectionStore(s => s.selectKeyframe);
    
    const currentTime = useTimelineStore(s => s.currentTime);
    const setCurrentTime = useTimelineStore(s => s.setCurrentTime);
    const isPlaying = useTimelineStore(s => s.isPlaying);
    const setPlaying = useTimelineStore(s => s.setPlaying);
    const zoom = useTimelineStore(s => s.zoom);
    const setZoom = useTimelineStore(s => s.setZoom);
    const duration = useTimelineStore(s => s.duration);
    const workAreaIn = useTimelineStore(s => s.workAreaIn);
    const workAreaOut = useTimelineStore(s => s.workAreaOut);
    
    const layers = useMemo(() => {
        if (!activeComp) return [];
        return activeComp.layers.map(id => allLayers[id]).filter(Boolean) as Layer[];
    }, [activeComp, allLayers]);

    // ─── Expand/collapse state ───
    const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
    const toggleExpand = useCallback((id: string) => {
        setExpandedLayers(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // Helper for changing layer color
    const handleColorLabelChange = (e: React.ChangeEvent<HTMLInputElement>, layerId: string) => {
        e.stopPropagation();
        useLayerStore.getState().updateLayer(layerId, { colorLabel: e.target.value });
    };
    
    const timelineRef = useRef<HTMLDivElement>(null);
    
    // Drag State
    const dragState = useRef<{
        type: DragType;
        layerId?: string;
        startX: number;
        startValue: number;
        startIn?: number;
        startOut?: number;
    }>({ type: null, startX: 0, startValue: 0 });

    const pixelsPerFrame = zoom * 2;
    const timelineWidth = duration * pixelsPerFrame;
    
    const formatTime = (frame: number) => {
        const fps = activeComp?.fps || 30;
        const totalSeconds = frame / fps;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const frames = Math.floor(frame % fps);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
    };
    
    // ─── Drag Handlers ───
    
    const handlePointerDown = useCallback((
        e: React.PointerEvent,
        type: DragType,
        initialValue: number,
        layer?: Layer
    ) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);

        dragState.current = {
            type,
            startX: e.clientX,
            startValue: initialValue,
            layerId: layer?.id,
            startIn: layer?.inPoint,
            startOut: layer?.outPoint
        };
        
        // Immediate seek on click for playhead
        if (type === 'playhead') {
             const rect = timelineRef.current?.getBoundingClientRect();
             if (rect) {
                 const x = e.clientX - rect.left + timelineRef.current!.scrollLeft;
                 const frame = Math.round(x / pixelsPerFrame);
                 setCurrentTime(Math.max(0, Math.min(frame, duration)));
             }
        }
    }, [pixelsPerFrame, setCurrentTime, duration]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const state = dragState.current;
        if (!state.type) return;

        const deltaX = e.clientX - state.startX;
        const deltaFrames = Math.round(deltaX / pixelsPerFrame);
        
        if (state.type === 'playhead') {
             const rect = timelineRef.current?.getBoundingClientRect();
             if (rect) {
                 const x = e.clientX - rect.left + timelineRef.current!.scrollLeft;
                 const frame = Math.round(x / pixelsPerFrame);
                 setCurrentTime(Math.max(0, Math.min(frame, duration)));
             }
        } else if (state.type === 'layer-in' && state.layerId && state.startIn !== undefined) {
             const newIn = Math.max(0, state.startIn + deltaFrames);
             const outPoint = allLayers[state.layerId].outPoint;
             // Must have at least 1 frame duration
             if (newIn <= outPoint - 1) updateLayer(state.layerId, { inPoint: newIn });
        } else if (state.type === 'layer-out' && state.layerId && state.startOut !== undefined) {
             const newOut = Math.min(duration, state.startOut + deltaFrames);
             const inPoint = allLayers[state.layerId].inPoint;
             if (newOut >= inPoint + 1) updateLayer(state.layerId, { outPoint: newOut });
        } else if (state.type === 'layer-move' && state.layerId && state.startIn !== undefined && state.startOut !== undefined) {
             const layerDuration = state.startOut - state.startIn;
             let newIn = state.startIn + deltaFrames;
             let newOut = state.startOut + deltaFrames;
             
             if (newIn < 0) {
                 newIn = 0;
                 newOut = layerDuration;
             }
             if (newOut > duration) {
                 newOut = duration;
                 newIn = duration - layerDuration;
             }
             
             updateLayer(state.layerId, { inPoint: newIn, outPoint: newOut });
        } else if (state.type === 'workarea-in') {
             const newIn = Math.max(0, state.startValue + deltaFrames);
             if (newIn < workAreaOut) useTimelineStore.getState().setWorkArea(newIn, workAreaOut);
        } else if (state.type === 'workarea-out') {
             const newOut = Math.min(duration, state.startValue + deltaFrames);
             if (newOut > workAreaIn) useTimelineStore.getState().setWorkArea(workAreaIn, newOut);
        }
    }, [pixelsPerFrame, setCurrentTime, duration, allLayers, updateLayer, workAreaIn, workAreaOut]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        const target = e.currentTarget;
        if (target.hasPointerCapture(e.pointerId)) {
            target.releasePointerCapture(e.pointerId);
        }
        dragState.current = { type: null, startX: 0, startValue: 0 };
    }, []);

    // ─── Scrolling & Zoom ───
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.altKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(zoom + delta);
        }
    }, [zoom, setZoom]);
    
    const rulerTicks = useMemo(() => {
        const fps = activeComp?.fps || 30;
        const ticks: { frame: number; label: string; isMajor: boolean }[] = [];
        const step = Math.max(1, Math.round(fps / (zoom * 2)));
        
        for (let f = 0; f <= duration; f += step) {
            const isMajor = f % fps === 0;
            ticks.push({
                frame: f,
                label: isMajor ? formatTime(f) : "",
                isMajor,
            });
        }
        return ticks;
    }, [duration, zoom, activeComp?.fps]);
    
    const TRACK_HEIGHT = 28;
    const LAYER_PANEL_WIDTH = 220;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Transport Controls Bar */}
            <div className="h-9 border-b border-[#222] bg-[#1a1a1a] flex items-center px-3 gap-2 flex-shrink-0">
                {/* Transport Buttons */}
                <div className="flex items-center gap-1">
                    <button 
                        className="p-1 hover:bg-[#333] rounded transition-colors text-zinc-400 hover:text-white"
                        onClick={() => setCurrentTime(0)}
                        title="Go to Start"
                    >
                        <SkipBack size={14} />
                    </button>
                    <button 
                        className="p-1 hover:bg-[#333] rounded transition-colors text-zinc-400 hover:text-white"
                        onClick={() => setPlaying(!isPlaying)}
                        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button 
                        className="p-1 hover:bg-[#333] rounded transition-colors text-zinc-400 hover:text-white"
                        onClick={() => setCurrentTime(duration)}
                        title="Go to End"
                    >
                        <SkipForward size={14} />
                    </button>
                </div>
                
                {/* Time Display */}
                <div className="font-mono text-[11px] text-zinc-300 bg-[#111] border border-[#333] rounded px-2 py-0.5 min-w-[80px] text-center">
                    {formatTime(currentTime)}
                </div>
                
                <div className="flex-1" />
                
                {/* Timeline Zoom */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <span>Zoom</span>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="5" 
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-16 h-1 accent-accent"
                    />
                </div>
            </div>
            
            {/* Main Timeline Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Layer List (Left Panel) */}
                <div className="flex-shrink-0 border-r border-[#222] bg-[#161616] flex flex-col" style={{ width: LAYER_PANEL_WIDTH }}>
                    {/* Layer list header */}
                    <div className="h-6 border-b border-[#222] flex items-center px-2 text-[10px] text-zinc-500 flex-shrink-0">
                        <span className="flex-1">Layers</span>
                        <button className="hover:text-white transition-colors" title="Add Layer">
                            <Plus size={12} />
                        </button>
                    </div>
                    
                    {/* Layer entries */}
                    <div className="flex-1 overflow-y-auto">
                        {layers.length === 0 && (
                            <div className="text-[10px] text-zinc-600 text-center py-8 italic">
                                No layers
                            </div>
                        )}
                        
                        {layers.map((layer) => {
                            const isSelected = selectedLayerIds.includes(layer.id);
                            const isExpanded = expandedLayers.has(layer.id);
                            const hasAnimated = PROP_ROWS.some(p => (layer.transform as any)[p.key]?.isAnimated);
                            
                            return (
                                <div key={layer.id}>
                                    {/* ── Main layer row ── */}
                                    <div 
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", layer.id);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const draggedId = e.dataTransfer.getData("text/plain");
                                            if (draggedId && draggedId !== layer.id && activeCompId) {
                                                useCompositionStore.getState()._reorderLayer(activeCompId, draggedId, layer.id);
                                            }
                                        }}
                                        className={`flex items-center gap-1 px-1 border-b border-[#1a1a1a] cursor-grab active:cursor-grabbing transition-colors ${
                                            isSelected ? "bg-accent/15 text-white" : "hover:bg-[#1e1e1e] text-zinc-400"
                                        }`}
                                        style={{ height: TRACK_HEIGHT }}
                                        onClick={(e) => selectLayer(layer.id, e.shiftKey || e.ctrlKey)}
                                    >
                                        {/* Expand toggle */}
                                        <button
                                            className={`flex-shrink-0 p-0.5 rounded hover:text-white transition-colors ${
                                                hasAnimated ? 'text-accent' : 'text-zinc-700'
                                            }`}
                                            onClick={(e) => { e.stopPropagation(); toggleExpand(layer.id); }}
                                            title={isExpanded ? 'Collapse' : 'Expand properties'}
                                        >
                                            {isExpanded
                                                ? <ChevronDown size={10} />
                                                : <ChevronRight size={10} />}
                                        </button>

                                        {/* Color label */}
                                        <div className="relative w-1.5 h-4 flex-shrink-0 cursor-pointer overflow-hidden rounded-full">
                                            <div 
                                                className="absolute inset-0 pointer-events-none" 
                                                style={{ backgroundColor: layer.colorLabel }} 
                                            />
                                            <input
                                                type="color"
                                                value={layer.colorLabel}
                                                onChange={(e) => handleColorLabelChange(e, layer.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute -inset-2 w-[200%] h-[200%] opacity-0 cursor-pointer"
                                                title="Change layer color"
                                            />
                                        </div>
                                        
                                        {/* Visibility toggle */}
                                        <button 
                                            className="p-0.5 hover:text-white transition-colors"
                                            onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                                            title={layer.visible ? "Hide" : "Show"}
                                        >
                                            {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                                        </button>
                                        
                                        {/* Lock toggle */}
                                        <button 
                                            className="p-0.5 hover:text-white transition-colors"
                                            onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
                                            title={layer.locked ? "Unlock" : "Lock"}
                                        >
                                            {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
                                        </button>
                                        
                                        {/* Layer name */}
                                        <span className="text-[11px] truncate flex-1 ml-0.5 select-none">
                                            {layer.name}
                                        </span>
                                        
                                        {/* Layer type badge */}
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider flex-shrink-0 select-none pr-1">
                                            {layer.type}
                                        </span>
                                    </div>

                                    {/* ── Property rows (expanded) ── */}
                                    {isExpanded && PROP_ROWS.map(prop => {
                                        const animProp = (layer.transform as any)[prop.key];
                                        const isAnim = animProp?.isAnimated;
                                        return (
                                            <div
                                                key={prop.key}
                                                className="flex items-center border-b border-[#1a1a1a] bg-[#0f0f0f]"
                                                style={{ height: TRACK_HEIGHT - 4 }}
                                            >
                                                <div className="w-2 flex-shrink-0" />
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1"
                                                    style={{ backgroundColor: isAnim ? prop.color : '#333' }}
                                                />
                                                <span className="text-[9px] text-zinc-600 select-none flex-1">
                                                    {prop.label}
                                                </span>
                                                {isAnim && (
                                                    <span className="text-[8px] text-zinc-700 pr-2">
                                                        {animProp.keyframes?.length ?? 0} keys
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Track Area (Right Panel — Scrollable Horizontally) */}
                <div 
                    className="flex-1 overflow-auto relative select-none"
                    ref={timelineRef}
                    onWheel={handleWheel}
                >
                    <div 
                        style={{ width: Math.max(timelineWidth, 800), minHeight: '100%' }} 
                        className="relative"
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        {/* Time Ruler */}
                        <div 
                            className="h-6 border-b border-[#222] bg-[#1a1a1a] sticky top-0 z-20 cursor-text relative"
                            onPointerDown={(e) => handlePointerDown(e, 'playhead', currentTime)}
                        >
                            {rulerTicks.map((tick) => (
                                <div 
                                    key={tick.frame}
                                    className="absolute top-0 flex flex-col items-center pointer-events-none"
                                    style={{ left: tick.frame * pixelsPerFrame }}
                                >
                                    <div className={`w-px ${tick.isMajor ? 'h-3 bg-zinc-500' : 'h-2 bg-zinc-700'}`} />
                                    {tick.label && (
                                        <span className="text-[8px] text-zinc-500 mt-0.5 whitespace-nowrap">
                                            {tick.label}
                                        </span>
                                    )}
                                </div>
                            ))}
                            
                            {/* Work Area Bar */}
                            <div 
                                className="absolute top-0 h-full bg-accent/10 border-x border-accent/50 cursor-move"
                                style={{
                                    left: workAreaIn * pixelsPerFrame,
                                    width: (workAreaOut - workAreaIn) * pixelsPerFrame,
                                }}
                            >
                                {/* Work Area Handles */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-ew-resize hover:bg-accent/40"
                                    onPointerDown={(e) => handlePointerDown(e, 'workarea-in', workAreaIn)}
                                />
                                <div 
                                    className="absolute right-0 top-0 bottom-0 w-2 -mr-1 cursor-ew-resize hover:bg-accent/40"
                                    onPointerDown={(e) => handlePointerDown(e, 'workarea-out', workAreaOut)}
                                />
                            </div>
                        </div>
                        
                        {/* Layer Tracks */}
                        <div className="relative">
                            {layers.map((layer) => {
                                const isSelected = selectedLayerIds.includes(layer.id);
                                const isExpanded = expandedLayers.has(layer.id);
                                const barLeft = layer.inPoint * pixelsPerFrame;
                                const barWidth = (layer.outPoint - layer.inPoint) * pixelsPerFrame;
                                
                                return (
                                    <div key={layer.id}>
                                        {/* ── Main track row ── */}
                                        <div 
                                            className={`relative border-b border-[#1a1a1a] ${
                                                isSelected ? 'bg-[#1a1a2a]' : 'bg-transparent'
                                            }`}
                                            style={{ height: TRACK_HEIGHT }}
                                        >
                                            {/* Layer Bar */}
                                            <div 
                                                className={`absolute top-1 bottom-1 rounded-[3px] transition-colors group ${
                                                    isSelected 
                                                        ? 'bg-accent/50 border border-accent/60' 
                                                        : 'bg-[#2a2a3a] border border-[#3a3a4a] hover:bg-[#333350]'
                                                } ${layer.locked ? 'opacity-50 pointer-events-none' : ''}`}
                                                style={{ left: barLeft, width: Math.max(barWidth, 4) }}
                                                onClick={(e) => { e.stopPropagation(); selectLayer(layer.id, e.shiftKey || e.ctrlKey); }}
                                                onPointerDown={(e) => handlePointerDown(e, 'layer-move', layer.inPoint, layer)}
                                            >
                                                {/* Trim handles */}
                                                <div 
                                                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-[3px]"
                                                    onPointerDown={(e) => {
                                                        if (!isSelected) selectLayer(layer.id, false);
                                                        handlePointerDown(e, 'layer-in', layer.inPoint, layer);
                                                    }}
                                                />
                                                <div 
                                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-[3px]"
                                                    onPointerDown={(e) => {
                                                        if (!isSelected) selectLayer(layer.id, false);
                                                        handlePointerDown(e, 'layer-out', layer.outPoint, layer);
                                                    }}
                                                />
                                                
                                                {/* Keyframe Diamonds */}
                                                {(() => {
                                                    const uniqueFrames = new Map<number, string>();
                                                    for (const p of PROP_ROWS) {
                                                        const prop = (layer.transform as any)?.[p.key];
                                                        if (prop?.isAnimated && prop.keyframes) {
                                                            for (const kf of prop.keyframes) {
                                                                uniqueFrames.set(kf.time, uniqueFrames.has(kf.time) ? "#a855f7" : p.color);
                                                            }
                                                        }
                                                    }
                                                    return Array.from(uniqueFrames.entries()).map(([frame, color]) => {
                                                        const xPos = (frame - layer.inPoint) * pixelsPerFrame;
                                                        if (xPos < 0 || xPos > barWidth) return null;
                                                        return (
                                                            <div
                                                                key={`kf-${frame}`}
                                                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-pointer hover:scale-150 transition-transform"
                                                                style={{ left: xPos }}
                                                                title={`Keyframe at frame ${frame}`}
                                                                onClick={(e) => {
                                                                    // For grouped property diamonds, we ideally want to select all keyframes at this frame. 
                                                                    // For now, we'll just stop propagation to prevent layer dragging
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <Diamond size={7} fill={color} stroke={color} />
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                                
                                                {/* Layer name inside bar */}
                                                <span className="text-[9px] text-white/70 px-2.5 pointer-events-none leading-none mt-[4px] block truncate">
                                                    {layer.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Property track rows (expanded) ── */}
                                        {isExpanded && PROP_ROWS.map(prop => {
                                            const animProp = (layer.transform as any)[prop.key];
                                            const keyframes = animProp?.isAnimated ? (animProp.keyframes || []) : [];
                                            const rowHeight = TRACK_HEIGHT - 4;
                                            return (
                                                <div
                                                    key={prop.key}
                                                    className="relative border-b border-[#1a1a1a] bg-[#0a0a0a]"
                                                    style={{ height: rowHeight }}
                                                >
                                                    {keyframes.map((kf: any) => {
                                                        const xPos = (kf.time - layer.inPoint) * pixelsPerFrame;
                                                        if (xPos < barLeft || xPos > barLeft + barWidth) return null;
                                                        return (
                                                            <div
                                                                key={kf.id}
                                                                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 cursor-pointer hover:scale-150 transition-transform ${
                                                                    selectedKeyframeIds.includes(kf.id) ? 'scale-150 brightness-150' : ''
                                                                }`}
                                                                style={{ left: barLeft + xPos }}
                                                                title={`${prop.label} keyframe @ frame ${kf.time}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    selectKeyframe(kf.id, e.shiftKey || e.ctrlKey);
                                                                }}
                                                            >
                                                                <Diamond size={6} fill={prop.color} stroke={prop.color} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                            
                            {layers.length === 0 && (
                                <div className="flex items-center justify-center h-32 text-[11px] text-zinc-600 italic">
                                    Add layers to the composition
                                </div>
                            )}
                        </div>
                        
                        {/* Playhead (CTI) */}
                        <div 
                            className="absolute top-0 bottom-0 z-30 pointer-events-none"
                            style={{ left: currentTime * pixelsPerFrame }}
                        >
                            <div className="w-px h-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                            <div className="absolute -top-0.5 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
