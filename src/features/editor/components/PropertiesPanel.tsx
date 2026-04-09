"use client";

import { useLayerStore } from "@/stores/layerStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useKeyframeStore } from "@/stores/keyframeStore";
import { Layer, BlendMode, TextLayerData, ShapeLayerData, SolidLayerData, GradientLayerData, ParticleLayerData } from "@/types/layer";
import { EFFECT_LIBRARY, Effect } from "@/types/effect";
import { useEffectStore } from "@/stores/effectStore";
import { resolveProperty } from "@/lib/interpolation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Diamond, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

export function PropertiesPanel() {
    const selectedLayerIds = useSelectionStore(s => s.selectedLayerIds);
    const allLayers = useLayerStore(s => s.layers);
    const updateLayer = useLayerStore(s => s.updateLayer);
    const currentTime = useTimelineStore(s => s.currentTime);
    const addOrUpdateKeyframe = useKeyframeStore(s => s.addOrUpdateKeyframe);
    const toggleAnimation = useKeyframeStore(s => s.toggleAnimation);
    const updateKeyframeEasing = useKeyframeStore(s => s.updateKeyframeEasing);
    const selectedKeyframeIds = useSelectionStore(s => s.selectedKeyframeIds);
    const allEffects = useEffectStore(s => s.effects);
    const addEffect = useEffectStore(s => s.addEffect);
    const removeEffect = useEffectStore(s => s.removeEffect);
    const toggleEffect = useEffectStore(s => s.toggleEffect);
    const updateEffectProperty = useEffectStore(s => s.updateEffectProperty);
    
    const selectedLayer = selectedLayerIds.length === 1 ? allLayers[selectedLayerIds[0]] : null;
    
    if (!selectedLayer) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="h-9 border-b border-[#222] flex items-center px-3 text-xs font-medium text-zinc-400 flex-shrink-0">
                    Inspector
                </div>
                <div className="flex-1 flex items-center justify-center text-[11px] text-zinc-600 p-6 text-center">
                    Select a layer to see its properties
                </div>
            </div>
        );
    }
    
    // Get current property value using smooth interpolation
    const pos = resolveProperty(selectedLayer.transform.position, currentTime);
    const scl = resolveProperty(selectedLayer.transform.scale, currentTime);
    const rot = resolveProperty(selectedLayer.transform.rotation, currentTime);
    const opa = resolveProperty(selectedLayer.transform.opacity, currentTime);
    const anc = resolveProperty(selectedLayer.transform.anchorPoint, currentTime);

    // Helper: set value — writes keyframe if animated, else sets static value
    const setTransformValue = (path: "transform.position" | "transform.scale" | "transform.rotation" | "transform.opacity" | "transform.anchorPoint", value: any) => {
        const keys = path.split('.');
        const prop = (selectedLayer as any)[keys[0]][keys[1]];
        if (prop.isAnimated) {
            addOrUpdateKeyframe(selectedLayer.id, path, currentTime, value, 'easeOut');
        } else {
            prop.value = value;
            updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform } });
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-9 border-b border-[#222] flex items-center px-3 text-xs font-medium text-zinc-300 flex-shrink-0">
                <div 
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: selectedLayer.colorLabel }} 
                />
                <span className="truncate flex-1">{selectedLayer.name}</span>
                <span className="text-[9px] text-zinc-600 uppercase ml-2">{selectedLayer.type}</span>
            </div>
            
            {/* Properties Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
                {/* Transform Section */}
                <PropertySection title="Transform" defaultOpen>
                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2">
                        <PropertyField 
                            label="X" 
                            value={Math.round(pos.x)} 
                            onChange={(v) => setTransformValue('transform.position', { ...pos, x: v })}
                            isAnimated={selectedLayer.transform.position.isAnimated}
                            onToggleAnim={() => toggleAnimation(selectedLayer.id, 'transform.position')}
                        />
                        <PropertyField 
                            label="Y" 
                            value={Math.round(pos.y)} 
                            onChange={(v) => setTransformValue('transform.position', { ...pos, y: v })}
                            isAnimated={selectedLayer.transform.position.isAnimated}
                        />
                    </div>
                    
                    {/* Scale */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <PropertyField 
                            label="Scale X" 
                            value={Math.round(scl.x)} 
                            onChange={(v) => setTransformValue('transform.scale', { ...scl, x: v })}
                            suffix="%"
                            isAnimated={selectedLayer.transform.scale.isAnimated}
                            onToggleAnim={() => toggleAnimation(selectedLayer.id, 'transform.scale')}
                        />
                        <PropertyField 
                            label="Scale Y" 
                            value={Math.round(scl.y)} 
                            onChange={(v) => setTransformValue('transform.scale', { ...scl, y: v })}
                            suffix="%"
                            isAnimated={selectedLayer.transform.scale.isAnimated}
                        />
                    </div>
                    
                    {/* Rotation */}
                    <div className="mt-2">
                        <PropertyField 
                            label="Rotation" 
                            value={Math.round(rot)} 
                            onChange={(v) => setTransformValue('transform.rotation', v)}
                            suffix="°"
                            isAnimated={selectedLayer.transform.rotation.isAnimated}
                            onToggleAnim={() => toggleAnimation(selectedLayer.id, 'transform.rotation')}
                        />
                    </div>
                    
                    {/* Opacity */}
                    <div className="mt-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-zinc-500 w-14 flex-shrink-0">Opacity</Label>
                            <Slider 
                                value={[opa]} 
                                max={100} 
                                min={0}
                                step={1}
                                onValueChange={(val) => setTransformValue('transform.opacity', val[0])}
                                className="flex-1"
                            />
                            <span className="text-[10px] text-zinc-400 w-8 text-right">{Math.round(opa)}%</span>
                        </div>
                    </div>
                    
                    {/* Anchor Point */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <PropertyField 
                            label="Anchor X" 
                            value={Math.round(anc.x)} 
                            onChange={(v) => setTransformValue('transform.anchorPoint', { ...anc, x: v })}
                            isAnimated={selectedLayer.transform.anchorPoint.isAnimated}
                            onToggleAnim={() => toggleAnimation(selectedLayer.id, 'transform.anchorPoint')}
                        />
                        <PropertyField 
                            label="Anchor Y" 
                            value={Math.round(anc.y)} 
                            onChange={(v) => setTransformValue('transform.anchorPoint', { ...anc, y: v })}
                            isAnimated={selectedLayer.transform.anchorPoint.isAnimated}
                        />
                    </div>
                </PropertySection>
                
                <Separator className="bg-[#222]" />
                
                {/* Blend Mode Section */}
                <PropertySection title="Compositing">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-zinc-500 w-14 flex-shrink-0">Blend</Label>
                            <select
                                className="flex-1 bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-accent"
                                value={selectedLayer.blendMode}
                                onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })}
                            >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="add">Add</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="difference">Difference</option>
                            </select>
                        </div>
                    </div>
                </PropertySection>
                
                <Separator className="bg-[#222]" />
                
                {/* Timing Section */}
                <PropertySection title="Timing">
                    <div className="grid grid-cols-2 gap-2">
                        <PropertyField 
                            label="In" 
                            value={selectedLayer.inPoint} 
                            onChange={(v) => updateLayer(selectedLayer.id, { inPoint: Math.max(0, v) })}
                        />
                        <PropertyField 
                            label="Out" 
                            value={selectedLayer.outPoint} 
                            onChange={(v) => updateLayer(selectedLayer.id, { outPoint: v })}
                        />
                    </div>
                </PropertySection>
                
                <Separator className="bg-[#222]" />

                {/* Keyframe Easing Section — only visible when keyframes are selected */}
                {selectedKeyframeIds.length > 0 && selectedLayer && (() => {
                    // Find selected keyframes across all animated properties
                    const TRANSFORM_PROPS = ['position', 'scale', 'rotation', 'opacity', 'anchorPoint'] as const;
                    const selectedKfs: { propPath: string; kf: any }[] = [];
                    for (const p of TRANSFORM_PROPS) {
                        const animProp = (selectedLayer.transform as any)[p];
                        if (animProp?.isAnimated && animProp.keyframes) {
                            for (const kf of animProp.keyframes) {
                                if (selectedKeyframeIds.includes(kf.id)) {
                                    selectedKfs.push({ propPath: `transform.${p}`, kf });
                                }
                            }
                        }
                    }
                    if (selectedKfs.length === 0) return null;

                    // Common easing across all selected keyframes
                    const allSame = selectedKfs.every(s => s.kf.interpolation === selectedKfs[0].kf.interpolation);
                    const currentEasing = allSame ? selectedKfs[0].kf.interpolation : 'mixed';

                    return (
                        <>
                            <Separator className="bg-[#222]" />
                            <PropertySection title={`Keyframe Easing (${selectedKfs.length})`} defaultOpen>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-zinc-500 w-14 flex-shrink-0">Easing</Label>
                                        <select
                                            className="flex-1 bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-accent"
                                            value={currentEasing}
                                            onChange={(e) => {
                                                const val = e.target.value as import("@/types/keyframe").InterpolationType;
                                                for (const s of selectedKfs) {
                                                    updateKeyframeEasing(selectedLayer.id, s.propPath, s.kf.id, val);
                                                }
                                            }}
                                        >
                                            {currentEasing === 'mixed' && <option value="mixed" disabled>Mixed</option>}
                                            <option value="linear">Linear</option>
                                            <option value="easeIn">Ease In</option>
                                            <option value="easeOut">Ease Out</option>
                                            <option value="bezier">Bezier</option>
                                            <option value="hold">Hold</option>
                                        </select>
                                    </div>

                                    {/* Easing preview curve */}
                                    <div className="bg-[#0a0a0a] rounded border border-[#222] p-2">
                                        <svg viewBox="0 0 100 60" className="w-full h-10">
                                            <line x1="0" y1="55" x2="100" y2="55" stroke="#333" strokeWidth="0.5" />
                                            <line x1="0" y1="5" x2="100" y2="5" stroke="#333" strokeWidth="0.5" />
                                            {(() => {
                                                const easing = currentEasing === 'mixed' ? 'linear' : currentEasing;
                                                let d = '';
                                                switch (easing) {
                                                    case 'linear':  d = 'M 5 55 L 95 5'; break;
                                                    case 'easeIn':  d = 'M 5 55 C 45 55, 75 25, 95 5'; break;
                                                    case 'easeOut': d = 'M 5 55 C 25 35, 55 5, 95 5'; break;
                                                    case 'bezier':  d = 'M 5 55 C 25 55, 75 5, 95 5'; break;
                                                    case 'hold':    d = 'M 5 55 L 90 55 L 90 5 L 95 5'; break;
                                                }
                                                return <path d={d} fill="none" stroke="#6366f1" strokeWidth="2" />;
                                            })()}
                                        </svg>
                                        <div className="text-[8px] text-zinc-600 text-center mt-1">
                                            {currentEasing === 'mixed' ? 'Multiple easing types' : currentEasing.charAt(0).toUpperCase() + currentEasing.slice(1)}
                                        </div>
                                    </div>

                                    {/* List selected keyframes */}
                                    <div className="space-y-1">
                                        {selectedKfs.map((s) => (
                                            <div key={s.kf.id} className="flex items-center justify-between text-[9px] text-zinc-500 px-1">
                                                <span>{s.propPath.split('.')[1]} @ f{s.kf.time}</span>
                                                <span className="text-zinc-600">{s.kf.interpolation}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </PropertySection>
                        </>
                    );
                })()}


                {/* Type-specific properties */}
                {selectedLayer.type === "text" && (
                    <PropertySection title="Text">
                        <TextProperties layer={selectedLayer} onUpdate={updateLayer} />
                    </PropertySection>
                )}
                
                {selectedLayer.type === "solid" && (
                    <PropertySection title="Solid">
                        <SolidProperties layer={selectedLayer} onUpdate={updateLayer} />
                    </PropertySection>
                )}
                
                {selectedLayer.type === "shape" && (
                    <PropertySection title="Shape">
                        <ShapeProperties layer={selectedLayer} onUpdate={updateLayer} />
                    </PropertySection>
                )}
                
                {selectedLayer.type === "gradient" && (
                    <PropertySection title="Gradient">
                        <GradientProperties layer={selectedLayer} onUpdate={updateLayer} />
                    </PropertySection>
                )}

                {selectedLayer.type === "particle" && (
                    <PropertySection title="Particle System">
                        <ParticleProperties layer={selectedLayer} onUpdate={updateLayer} />
                    </PropertySection>
                )}
                
                <Separator className="bg-[#222]" />
                
                {/* Effects Section */}
                <PropertySection title={`Effects (${selectedLayer.effects.length})`}>
                    {/* Add effect dropdown */}
                    <div className="mb-2">
                        <select
                            className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none focus:border-accent"
                            value=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    addEffect(selectedLayer.id, e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        >
                            <option value="" disabled>+ Add Effect…</option>
                            {EFFECT_LIBRARY.map(def => (
                                <option key={def.id} value={def.id}>{def.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedLayer.effects.length === 0 ? (
                        <div className="text-[10px] text-zinc-600 italic py-2">
                            No effects applied
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {selectedLayer.effects.map(eid => {
                                const eff = allEffects[eid];
                                if (!eff) return null;
                                const def = EFFECT_LIBRARY.find(d => d.id === eff.type);
                                if (!def) return null;

                                return (
                                    <div key={eid} className="bg-[#111] rounded border border-[#222] overflow-hidden">
                                        {/* Effect header */}
                                        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#1a1a1a]">
                                            <button
                                                className={`w-3 h-3 rounded-sm text-[8px] flex items-center justify-center border ${
                                                    eff.enabled
                                                        ? 'bg-accent/30 border-accent text-accent'
                                                        : 'bg-transparent border-[#444] text-zinc-600'
                                                }`}
                                                onClick={() => toggleEffect(eid)}
                                                title={eff.enabled ? 'Disable' : 'Enable'}
                                            >
                                                ✓
                                            </button>
                                            <span className={`text-[10px] flex-1 ${eff.enabled ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>
                                                {eff.name}
                                            </span>
                                            <button
                                                className="text-[9px] text-red-500/60 hover:text-red-400 transition-colors px-1"
                                                onClick={() => removeEffect(selectedLayer.id, eid)}
                                                title="Remove effect"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        {/* Effect properties */}
                                        {eff.enabled && (
                                            <div className="px-2 py-1.5 space-y-1.5">
                                                {def.parameters.map(param => (
                                                    <div key={param.id} className="flex items-center gap-2">
                                                        <Label className="text-[9px] text-zinc-500 w-12 flex-shrink-0">{param.name}</Label>
                                                        {param.type === 'number' && (
                                                            <div className="flex items-center gap-1 flex-1">
                                                                <input
                                                                    type="range"
                                                                    min={param.min ?? 0}
                                                                    max={param.max ?? 100}
                                                                    step={param.step ?? 1}
                                                                    value={eff.properties[param.id] ?? param.defaultValue}
                                                                    onChange={(e) => updateEffectProperty(eid, param.id, Number(e.target.value))}
                                                                    className="flex-1 accent-accent h-1"
                                                                />
                                                                <span className="text-[8px] text-zinc-600 w-6 text-right">
                                                                    {Math.round(eff.properties[param.id] ?? param.defaultValue)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {param.type === 'color' && (
                                                            <input
                                                                type="color"
                                                                value={eff.properties[param.id] ?? param.defaultValue}
                                                                onChange={(e) => updateEffectProperty(eid, param.id, e.target.value)}
                                                                className="w-6 h-5 bg-transparent border-none cursor-pointer"
                                                            />
                                                        )}
                                                        {param.type === 'boolean' && (
                                                            <input
                                                                type="checkbox"
                                                                checked={eff.properties[param.id] ?? param.defaultValue}
                                                                onChange={(e) => updateEffectProperty(eid, param.id, e.target.checked)}
                                                                className="accent-accent"
                                                            />
                                                        )}
                                                        {param.type === 'select' && (
                                                            <select
                                                                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-1 py-0.5 text-[9px] text-zinc-400"
                                                                value={eff.properties[param.id] ?? param.defaultValue}
                                                                onChange={(e) => updateEffectProperty(eid, param.id, e.target.value)}
                                                            >
                                                                {param.options?.map(o => (
                                                                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </PropertySection>
            </div>
        </div>
    );
}

// ─── Reusable Components ───

function PropertySection({ title, children, defaultOpen = false }: { 
    title: string; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="border-b border-transparent">
            <button 
                className="w-full flex items-center gap-1 px-3 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                {title}
            </button>
            {isOpen && (
                <div className="px-3 pb-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function PropertyField({ 
    label, value, onChange, suffix, isAnimated, onToggleAnim 
}: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    suffix?: string;
    isAnimated?: boolean;
    onToggleAnim?: () => void;
}) {
    return (
        <div className="flex items-center gap-1">
            {isAnimated !== undefined && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleAnim?.(); }}
                    className="flex-shrink-0 hover:scale-125 transition-transform"
                    title={isAnimated ? 'Disable animation (remove keyframes)' : 'Enable keyframe animation'}
                >
                    <Diamond 
                        size={8} 
                        className={isAnimated ? 'text-accent fill-accent' : 'text-zinc-600 hover:text-zinc-400'} 
                    />
                </button>
            )}
            <Label className="text-[10px] text-zinc-500 w-10 flex-shrink-0">{label}</Label>
            <Input 
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-6 bg-[#111] border-[#333] text-[10px] text-zinc-300 px-1.5 rounded-sm focus-visible:ring-accent/50"
            />
            {suffix && <span className="text-[9px] text-zinc-600 flex-shrink-0">{suffix}</span>}
        </div>
    );
}

// ─── Type-specific property editors ───

function TextProperties({ layer, onUpdate }: { layer: Layer; onUpdate: (id: string, patch: Partial<Layer>) => void }) {
    const data = (layer.data || {}) as TextLayerData;
    
    const update = (patch: Partial<TextLayerData>) => {
        onUpdate(layer.id, { data: { ...data, ...patch } });
    };
    
    return (
        <div className="space-y-2">
            <div>
                <Label className="text-[10px] text-zinc-500">Content</Label>
                <textarea 
                    value={data.content || ""}
                    onChange={(e) => update({ content: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded px-2 py-1.5 text-[11px] text-zinc-300 resize-none h-16 focus:outline-none focus:border-accent mt-1"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Font Size</Label>
                    <Input 
                        type="number" 
                        value={data.fontSize || 48}
                        onChange={(e) => update({ fontSize: Number(e.target.value) })}
                        className="h-6 bg-[#111] border-[#333] text-[10px] mt-1"
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">Color</Label>
                    <Input 
                        type="color" 
                        value={data.color || "#ffffff"}
                        onChange={(e) => update({ color: e.target.value })}
                        className="h-6 bg-[#111] border-[#333] mt-1 p-0.5"
                    />
                </div>
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Font Family</Label>
                <Input 
                    type="text" 
                    value={data.fontFamily || "Inter"}
                    onChange={(e) => update({ fontFamily: e.target.value })}
                    className="h-6 bg-[#111] border-[#333] text-[10px] mt-1"
                />
            </div>
        </div>
    );
}

function SolidProperties({ layer, onUpdate }: { layer: Layer; onUpdate: (id: string, patch: Partial<Layer>) => void }) {
    const data = (layer.data || {}) as SolidLayerData;
    
    const update = (patch: Partial<SolidLayerData>) => {
        onUpdate(layer.id, { data: { ...data, ...patch } });
    };
    
    return (
        <div className="space-y-2">
            <div>
                <Label className="text-[10px] text-zinc-500">Color</Label>
                <Input 
                    type="color" 
                    value={data.color || "#666666"}
                    onChange={(e) => update({ color: e.target.value })}
                    className="h-8 bg-[#111] border-[#333] mt-1 p-0.5 w-full"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Width</Label>
                    <Input 
                        type="number" 
                        value={data.width || 1920}
                        onChange={(e) => update({ width: Number(e.target.value) })}
                        className="h-6 bg-[#111] border-[#333] text-[10px] mt-1"
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">Height</Label>
                    <Input 
                        type="number" 
                        value={data.height || 1080}
                        onChange={(e) => update({ height: Number(e.target.value) })}
                        className="h-6 bg-[#111] border-[#333] text-[10px] mt-1"
                    />
                </div>
            </div>
        </div>
    );
}

function ShapeProperties({ layer, onUpdate }: { layer: Layer; onUpdate: (id: string, patch: Partial<Layer>) => void }) {
    const data = (layer.data || {}) as ShapeLayerData;
    
    const update = (patch: Partial<ShapeLayerData>) => {
        onUpdate(layer.id, { data: { ...data, ...patch } });
    };
    
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Fill</Label>
                    <Input 
                        type="color" 
                        value={data.fill || "#6366f1"}
                        onChange={(e) => update({ fill: e.target.value })}
                        className="h-6 bg-[#111] border-[#333] mt-1 p-0.5"
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">Stroke</Label>
                    <Input 
                        type="color" 
                        value={data.stroke || "#transparent"}
                        onChange={(e) => update({ stroke: e.target.value })}
                        className="h-6 bg-[#111] border-[#333] mt-1 p-0.5"
                    />
                </div>
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Border Radius</Label>
                <Input 
                    type="number" 
                    value={data.borderRadius || 0}
                    onChange={(e) => update({ borderRadius: Number(e.target.value) })}
                    className="h-6 bg-[#111] border-[#333] text-[10px] mt-1"
                />
            </div>
        </div>
    );
}

function GradientProperties({ layer, onUpdate }: { layer: Layer; onUpdate: (id: string, patch: Partial<Layer>) => void }) {
    const data = (layer.data || {}) as GradientLayerData;
    const update = (patch: Partial<GradientLayerData>) => onUpdate(layer.id, { data: { ...data, ...patch } });
    const colors = data.colors || [{ color: '#6366f1', stop: 0 }, { color: '#ec4899', stop: 100 }];

    return (
        <div className="space-y-2">
            <div>
                <Label className="text-[10px] text-zinc-500">Type</Label>
                <select
                    className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-zinc-300 mt-1 focus:outline-none focus:border-accent"
                    value={data.gradientType || 'linear'}
                    onChange={(e) => update({ gradientType: e.target.value as any })}
                >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                    <option value="conic">Conic</option>
                </select>
            </div>
            {(data.gradientType === 'linear' || data.gradientType === 'conic' || !data.gradientType) && (
                <div>
                    <Label className="text-[10px] text-zinc-500">Angle</Label>
                    <input
                        type="range" min="0" max="360"
                        value={data.angle ?? 90}
                        onChange={(e) => update({ angle: Number(e.target.value) })}
                        className="w-full accent-accent mt-1"
                    />
                    <span className="text-[9px] text-zinc-500">{data.angle ?? 90}°</span>
                </div>
            )}
            <div>
                <Label className="text-[10px] text-zinc-500 mb-1 block">Color Stops</Label>
                {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                        <Input
                            type="color"
                            value={c.color}
                            onChange={(e) => {
                                const next = [...colors];
                                next[i] = { ...next[i], color: e.target.value };
                                update({ colors: next });
                            }}
                            className="h-6 w-10 bg-[#111] border-[#333] p-0.5"
                        />
                        <input
                            type="range" min="0" max="100"
                            value={c.stop}
                            onChange={(e) => {
                                const next = [...colors];
                                next[i] = { ...next[i], stop: Number(e.target.value) };
                                update({ colors: next });
                            }}
                            className="flex-1 accent-accent"
                        />
                        <span className="text-[9px] text-zinc-500 w-6">{c.stop}%</span>
                        {colors.length > 2 && (
                            <button
                                onClick={() => update({ colors: colors.filter((_, j) => j !== i) })}
                                className="text-red-500 text-[10px] hover:text-red-400"
                            >×</button>
                        )}
                    </div>
                ))}
                <button
                    onClick={() => update({ colors: [...colors, { color: '#ffffff', stop: 100 }] })}
                    className="text-[10px] text-accent hover:text-accent/80 mt-1"
                >+ Add Stop</button>
            </div>
        </div>
    );
}

function ParticleProperties({ layer, onUpdate }: { layer: Layer; onUpdate: (id: string, patch: Partial<Layer>) => void }) {
    const data = (layer.data || {}) as ParticleLayerData;
    const update = (patch: Partial<ParticleLayerData>) => onUpdate(layer.id, { data: { ...data, ...patch } });

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Count</Label>
                    <Input type="number" min={1} max={500}
                        value={data.count ?? 80}
                        onChange={(e) => update({ count: Number(e.target.value) })}
                        className="h-6 bg-[#111] border-[#333] text-[10px] mt-1" />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">Shape</Label>
                    <select
                        className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[10px] text-zinc-300 mt-1 focus:outline-none focus:border-accent"
                        value={data.shape || 'circle'}
                        onChange={(e) => update({ shape: e.target.value as any })}
                    >
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                        <option value="star">Star</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Color</Label>
                    <Input type="color"
                        value={data.color || '#6366f1'}
                        onChange={(e) => update({ color: e.target.value })}
                        className="h-6 bg-[#111] border-[#333] mt-1 p-0.5" />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">End Color</Label>
                    <Input type="color"
                        value={data.colorEnd || '#ec4899'}
                        onChange={(e) => update({ colorEnd: e.target.value })}
                        className="h-6 bg-[#111] border-[#333] mt-1 p-0.5" />
                </div>
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Size <span className="text-zinc-600">(px)</span></Label>
                <input type="range" min="1" max="80"
                    value={data.size ?? 6}
                    onChange={(e) => update({ size: Number(e.target.value) })}
                    className="w-full accent-accent mt-1" />
                <span className="text-[9px] text-zinc-500">{data.size ?? 6}px</span>
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Speed</Label>
                <input type="range" min="0.1" max="20" step="0.1"
                    value={data.speed ?? 2}
                    onChange={(e) => update({ speed: Number(e.target.value) })}
                    className="w-full accent-accent mt-1" />
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Spread <span className="text-zinc-600">(°)</span></Label>
                <input type="range" min="0" max="360"
                    value={data.spread ?? 360}
                    onChange={(e) => update({ spread: Number(e.target.value) })}
                    className="w-full accent-accent mt-1" />
                <span className="text-[9px] text-zinc-500">{data.spread ?? 360}°</span>
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Gravity</Label>
                <input type="range" min="0" max="1" step="0.01"
                    value={data.gravity ?? 0.02}
                    onChange={(e) => update({ gravity: Number(e.target.value) })}
                    className="w-full accent-accent mt-1" />
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Lifetime <span className="text-zinc-600">(frames)</span></Label>
                <Input type="number" min={1} max={300}
                    value={data.life ?? 60}
                    onChange={(e) => update({ life: Number(e.target.value) })}
                    className="h-6 bg-[#111] border-[#333] text-[10px] mt-1" />
            </div>
            <div>
                <Label className="text-[10px] text-zinc-500">Blur</Label>
                <input type="range" min="0" max="20" step="0.5"
                    value={data.blurRadius ?? 1}
                    onChange={(e) => update({ blurRadius: Number(e.target.value) })}
                    className="w-full accent-accent mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-[10px] text-zinc-500">Spawn X</Label>
                    <input type="range" min="0" max="1" step="0.01"
                        value={data.spawnX ?? 0.5}
                        onChange={(e) => update({ spawnX: Number(e.target.value) })}
                        className="w-full accent-accent mt-1" />
                </div>
                <div>
                    <Label className="text-[10px] text-zinc-500">Spawn Y</Label>
                    <input type="range" min="0" max="1" step="0.01"
                        value={data.spawnY ?? 0.5}
                        onChange={(e) => update({ spawnY: Number(e.target.value) })}
                        className="w-full accent-accent mt-1" />
                </div>
            </div>
        </div>
    );
}
