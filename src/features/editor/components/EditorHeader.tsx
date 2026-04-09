"use client";

import { 
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { useHistoryStore } from "@/stores/historyStore";
import { useCompositionStore } from "@/stores/compositionStore";
import { useLayerStore } from "@/stores/layerStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { ExportDialog } from "./ExportDialog";
import { CompositionSettingsDialog } from "./CompositionSettingsDialog";
import { useState } from "react";

export function EditorHeader() {
    const undo = useHistoryStore(s => s.undo);
    const redo = useHistoryStore(s => s.redo);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const [exportOpen, setExportOpen] = useState(false);
    const [compSettingsOpen, setCompSettingsOpen] = useState(false);

    // ─── File Actions ───
    const handleNewProject = () => {
        // Create a fresh composition
        const compId = useCompositionStore.getState().addComposition({
            name: "New Composition",
            width: 1920,
            height: 1080,
            fps: 30,
            durationInFrames: 300,
            backgroundColor: "#000000",
        });
        useCompositionStore.getState().setActiveComposition(compId);
        useTimelineStore.getState().setDuration(300);
    };

    // ─── Edit Actions ───
    const handleDelete = () => {
        const selectedIds = useSelectionStore.getState().selectedLayerIds;
        if (!activeCompId || selectedIds.length === 0) return;
        for (const id of selectedIds) {
            useLayerStore.getState().removeLayer(activeCompId, id);
            useCompositionStore.getState()._removeLayerFromComp(activeCompId, id);
        }
        useSelectionStore.getState().selectLayer(null);
    };

    const handleDuplicate = () => {
        const selectedIds = useSelectionStore.getState().selectedLayerIds;
        if (!activeCompId || selectedIds.length === 0) return;
        for (const id of selectedIds) {
            const newId = useLayerStore.getState().duplicateLayer(activeCompId, id);
            if (newId) {
                useSelectionStore.getState().selectLayer(newId);
            }
        }
    };

    // ─── Composition Actions ───
    const handleNewComposition = () => {
        const compId = useCompositionStore.getState().addComposition({
            name: "New Composition",
            width: 1920,
            height: 1080,
            fps: 30,
            durationInFrames: 300,
            backgroundColor: "#000000",
        });
        useCompositionStore.getState().setActiveComposition(compId);
        useTimelineStore.getState().setDuration(300);
    };

    const handleTrimToWorkArea = () => {
        if (!activeCompId) return;
        const { workAreaIn, workAreaOut } = useTimelineStore.getState();
        useCompositionStore.getState().updateCompositionSettings(activeCompId, {
            durationInFrames: workAreaOut - workAreaIn,
        });
        useTimelineStore.getState().setDuration(workAreaOut - workAreaIn);
    };

    // ─── Layer Actions ───
    const handleNewSolid = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "solid", "Solid Layer", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: { color: "#333333", width: 1920, height: 1080 },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };

    const handleNewText = () => {
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
    };

    const handleNewShape = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "shape", "Shape Layer", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: { fill: "#6366f1", width: 200, height: 200, borderRadius: 0, shapeType: "rectangle" },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };

    const handleNewGradient = () => {
        if (!activeCompId) return;
        const currentTime = useTimelineStore.getState().currentTime;
        const duration = useTimelineStore.getState().duration;
        const layerId = useLayerStore.getState().addLayer(activeCompId, "gradient", "Gradient Layer", {
            inPoint: currentTime,
            outPoint: Math.min(currentTime + 150, duration),
            data: {
                gradientType: "linear",
                angle: 90,
                width: 1920,
                height: 1080,
                colors: [
                    { color: "#6366f1", stop: 0 },
                    { color: "#ec4899", stop: 100 },
                ],
            },
        });
        useCompositionStore.getState()._addLayerToComp(activeCompId, layerId);
        useSelectionStore.getState().selectLayer(layerId);
    };

    const handleNewParticle = () => {
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

    const handleSplitLayer = () => {
        const selectedIds = useSelectionStore.getState().selectedLayerIds;
        if (!activeCompId || selectedIds.length === 0) return;
        const currentTime = useTimelineStore.getState().currentTime;
        for (const id of selectedIds) {
            useLayerStore.getState().splitLayer(activeCompId, id, currentTime);
        }
    };

    return (
        <div className="flex items-center h-full px-2 w-full justify-between">
            <div className="flex items-center gap-4">
                <span className="font-semibold text-white tracking-tight ml-2 max-lg:hidden">MotionAI</span>
                
                <Menubar className="border-none bg-transparent h-8">
                    {/* ─── File Menu ─── */}
                    <MenubarMenu>
                        <MenubarTrigger className="text-xs font-normal cursor-pointer data-[state=open]:bg-[#2a2a2a] focus:bg-[#2a2a2a]">File</MenubarTrigger>
                        <MenubarContent className="bg-[#1e1e1e] border-[#333] text-zinc-300 min-w-[220px]">
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewProject}>
                                New Project... <MenubarShortcut>Ctrl+N</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer">
                                Save <MenubarShortcut>Ctrl+S</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer">Save As...</MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer">Project Settings...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    
                    {/* ─── Edit Menu ─── */}
                    <MenubarMenu>
                        <MenubarTrigger className="text-xs font-normal cursor-pointer data-[state=open]:bg-[#2a2a2a] focus:bg-[#2a2a2a]">Edit</MenubarTrigger>
                        <MenubarContent className="bg-[#1e1e1e] border-[#333] text-zinc-300 min-w-[220px]">
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={undo}>
                                Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={redo}>
                                Redo <MenubarShortcut>Ctrl+Shift+Z</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleDuplicate}>
                                Duplicate <MenubarShortcut>Ctrl+D</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-red-500/20 text-red-400 focus:text-red-300 cursor-pointer" onClick={handleDelete}>
                                Delete <MenubarShortcut>Del</MenubarShortcut>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    
                    {/* ─── Composition Menu ─── */}
                    <MenubarMenu>
                        <MenubarTrigger className="text-xs font-normal cursor-pointer data-[state=open]:bg-[#2a2a2a] focus:bg-[#2a2a2a]">Composition</MenubarTrigger>
                        <MenubarContent className="bg-[#1e1e1e] border-[#333] text-zinc-300 min-w-[220px]">
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewComposition}>
                                New Composition <MenubarShortcut>Ctrl+N</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={() => setCompSettingsOpen(true)}>
                                Composition Settings… <MenubarShortcut>Ctrl+K</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleTrimToWorkArea}>
                                Trim to Work Area
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    
                    {/* ─── Layer Menu ─── */}
                    <MenubarMenu>
                        <MenubarTrigger className="text-xs font-normal cursor-pointer data-[state=open]:bg-[#2a2a2a] focus:bg-[#2a2a2a]">Layer</MenubarTrigger>
                        <MenubarContent className="bg-[#1e1e1e] border-[#333] text-zinc-300 min-w-[220px]">
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewSolid}>
                                New → Solid
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewText}>
                                New → Text
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewShape}>
                                New → Shape
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewGradient}>
                                New → Gradient
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleNewParticle}>
                                New → Particle System
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleSplitLayer}>
                                Split Layer <MenubarShortcut>Ctrl+Shift+D</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer" onClick={handleDuplicate}>
                                Duplicate Layer <MenubarShortcut>Ctrl+D</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator className="bg-[#333]" />
                            <MenubarItem className="text-xs focus:bg-red-500/20 text-red-400 focus:text-red-300 cursor-pointer" onClick={handleDelete}>
                                Delete Layer <MenubarShortcut>Del</MenubarShortcut>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
            
            <div className="flex items-center gap-3 mr-2">
                {/* Export Button */}
                <button
                    onClick={() => setExportOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer"
                >
                    Export
                </button>
            </div>

            <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
            <CompositionSettingsDialog open={compSettingsOpen} onClose={() => setCompSettingsOpen(false)} />
        </div>
    );
}
