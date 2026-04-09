"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompositionStore } from "@/stores/compositionStore";
import { useTimelineStore } from "@/stores/timelineStore";

const PRESETS = [
    { label: "1080p 30fps",  width: 1920, height: 1080, fps: 30 },
    { label: "1080p 60fps",  width: 1920, height: 1080, fps: 60 },
    { label: "4K 30fps",     width: 3840, height: 2160, fps: 30 },
    { label: "720p 30fps",   width: 1280, height: 720,  fps: 30 },
    { label: "Square 1080",  width: 1080, height: 1080, fps: 30 },
    { label: "9:16 1080p",   width: 1080, height: 1920, fps: 30 },
    { label: "Twitter/X",    width: 1280, height: 720,  fps: 30 },
    { label: "Cinematic 4K", width: 4096, height: 1716, fps: 24 },
] as const;

interface CompositionSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CompositionSettingsDialog({ open, onClose }: CompositionSettingsDialogProps) {
    const compositions = useCompositionStore(s => s.compositions);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const setDuration = useTimelineStore(s => s.setDuration);

    const activeComp = compositions.find(c => c.id === activeCompId);

    const [name, setName] = useState("");
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [fps, setFps] = useState(30);
    const [duration, setDurationFrames] = useState(300);
    const [bgColor, setBgColor] = useState("#000000");

    // Sync from active comp when dialog opens
    useEffect(() => {
        if (open && activeComp) {
            setName(activeComp.name);
            setWidth(activeComp.width);
            setHeight(activeComp.height);
            setFps(activeComp.fps);
            setDurationFrames(activeComp.durationInFrames);
            setBgColor(activeComp.backgroundColor || "#000000");
        }
    }, [open, activeComp]);

    const applyPreset = (preset: typeof PRESETS[number]) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setFps(preset.fps);
    };

    const handleSave = () => {
        if (!activeCompId) return;
        
        // Composition store needs to handle name as well
        // Let's pass what's defined in CompositionSettings, then update name separately 
        // to appease the type system since name is in Composition but not CompositionSettings.
        useCompositionStore.setState(s => {
            const c = s.compositions.find(comp => comp.id === activeCompId);
            if (c) {
                c.name = name.trim() || "Untitled Composition";
                c.width = width;
                c.height = height;
                c.fps = fps;
                c.durationInFrames = duration;
                c.backgroundColor = bgColor;
            }
        });
        setDuration(duration);
        onClose();
    };

    const durationSec = (duration / fps).toFixed(2);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="bg-[#1a1a1a] border-[#333] text-zinc-200 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-white">Composition Settings</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        {activeComp?.name} — changes apply immediately
                    </DialogDescription>
                </DialogHeader>

                {!activeComp ? (
                    <p className="text-zinc-500 text-sm py-4 text-center">No active composition</p>
                ) : (
                    <div className="space-y-4 mt-2">
                        {/* Name */}
                        <div>
                            <Label className="text-xs text-zinc-400 mb-1 block">Name</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-[#111] border-[#333] text-zinc-200 focus:border-accent text-sm"
                                placeholder="Composition name"
                            />
                        </div>

                        {/* Presets */}
                        <div>
                            <Label className="text-xs text-zinc-400 mb-1 block">Presets</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESETS.map(p => (
                                    <button
                                        key={p.label}
                                        onClick={() => applyPreset(p)}
                                        className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                                            width === p.width && height === p.height && fps === p.fps
                                                ? "border-accent bg-accent/10 text-white"
                                                : "border-[#333] bg-[#111] text-zinc-500 hover:border-[#555] hover:text-zinc-300"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resolution */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-zinc-400 mb-1 block">Width (px)</Label>
                                <Input
                                    type="number" min={1} max={7680}
                                    value={width}
                                    onChange={e => setWidth(Number(e.target.value))}
                                    className="bg-[#111] border-[#333] text-zinc-200 focus:border-accent text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-400 mb-1 block">Height (px)</Label>
                                <Input
                                    type="number" min={1} max={4320}
                                    value={height}
                                    onChange={e => setHeight(Number(e.target.value))}
                                    className="bg-[#111] border-[#333] text-zinc-200 focus:border-accent text-sm"
                                />
                            </div>
                        </div>

                        {/* FPS + Duration */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-zinc-400 mb-1 block">Frame Rate (fps)</Label>
                                <select
                                    value={fps}
                                    onChange={e => setFps(Number(e.target.value))}
                                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent"
                                >
                                    {[12, 15, 23.976, 24, 25, 29.97, 30, 48, 60, 120].map(f => (
                                        <option key={f} value={f}>{f} fps</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs text-zinc-400 mb-1 block">
                                    Duration (frames)
                                    <span className="text-zinc-600 ml-1">= {durationSec}s</span>
                                </Label>
                                <Input
                                    type="number" min={1} max={54000}
                                    value={duration}
                                    onChange={e => setDurationFrames(Number(e.target.value))}
                                    className="bg-[#111] border-[#333] text-zinc-200 focus:border-accent text-sm"
                                />
                            </div>
                        </div>

                        {/* Background Color */}
                        <div>
                            <Label className="text-xs text-zinc-400 mb-1 block">Background Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={e => setBgColor(e.target.value)}
                                    className="h-8 w-12 bg-[#111] border border-[#333] rounded p-0.5 cursor-pointer"
                                />
                                <Input
                                    value={bgColor}
                                    onChange={e => setBgColor(e.target.value)}
                                    className="bg-[#111] border-[#333] text-zinc-200 focus:border-accent text-sm font-mono"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-[11px] text-zinc-500">
                            <span className="text-zinc-400">{width}×{height}</span>
                            {" · "}
                            <span className="text-zinc-400">{fps} fps</span>
                            {" · "}
                            <span className="text-zinc-400">{duration} frames ({durationSec}s)</span>
                            {" · "}
                            <span style={{ color: bgColor }} className="font-mono">{bgColor}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-1">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-zinc-400 hover:text-white border border-[#333]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-accent hover:bg-accent/90 text-white"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
