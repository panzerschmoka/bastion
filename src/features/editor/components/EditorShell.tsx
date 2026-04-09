"use client";

import { EditorHeader } from "./EditorHeader";
import { Toolbar } from "./Toolbar";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Timeline } from "./Timeline";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlayback } from "@/hooks/usePlayback";
import { useHistoryStore } from "@/stores/historyStore";
import { useCompositionStore } from "@/stores/compositionStore";
import { useTimelineStore } from "@/stores/timelineStore";

export default function EditorShell() {
    useKeyboardShortcuts();
    usePlayback();

    const compositions = useCompositionStore(s => s.compositions);
    const activeCompId = useCompositionStore(s => s.activeCompositionId);
    const activeComp = compositions.find(c => c.id === activeCompId);
    const currentTime = useTimelineStore(s => s.currentTime);
    const canUndo = useHistoryStore(s => s.undoStack.length > 0);

    return (
        <div className="h-screen w-screen flex flex-col bg-[#111111] text-zinc-300 overflow-hidden font-sans select-none">
            {/* Top Menu Bar */}
            <div className="h-10 border-b border-[#222222] bg-[#1a1a1a] flex-shrink-0">
                <EditorHeader />
            </div>

            {/* Main Application Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left side: Toolbar (Thin vertical strip) */}
                <div className="w-12 border-r border-[#222222] bg-[#161616] flex-shrink-0">
                    <Toolbar />
                </div>
                
                {/* Center: Main Canvas + Bottom Timeline */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Viewport Area */}
                    <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
                        {/* We could add horizontal panel splitters here later for project bin, etc. */}
                        <Canvas />
                    </div>
                    
                    {/* Horizontal Splitter (Visual only for now, could be resizable) */}
                    <div className="h-1 bg-[#222222] cursor-row-resize hover:bg-accent transition-colors z-50 relative" />
                    
                    {/* Bottom: Timeline Panel */}
                    <div className="h-[35vh] min-h-[200px] flex-shrink-0 bg-[#161616] border-t border-black relative z-40">
                        <Timeline />
                    </div>
                </div>
                
                {/* Vertical Splitter */}
                <div className="w-1 bg-[#222222] cursor-col-resize hover:bg-accent transition-colors z-50 relative" />

                {/* Right side: Inspector Panel (Properties + Effects) */}
                <div className="w-80 border-l border-[#222222] bg-[#161616] flex-shrink-0 flex flex-col">
                    <PropertiesPanel />
                </div>
            </div>
            
            {/* Bottom Status Bar */}
            <div className="h-6 border-t border-[#222222] bg-[#1a1a1a] flex-shrink-0 flex items-center px-4 text-[10px] text-zinc-500 justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-medium">{activeComp?.name ?? 'No composition'}</span>
                    {activeComp && (
                        <>
                            <span className="text-zinc-700">|</span>
                            <span>{activeComp.width}×{activeComp.height}</span>
                            <span className="text-zinc-700">|</span>
                            <span>{activeComp.fps} fps</span>
                            <span className="text-zinc-700">|</span>
                            <span className="font-mono">{currentTime} / {activeComp.durationInFrames} frames</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {canUndo && <span className="text-accent/60">● unsaved</span>}
                    <span>MotionAI v0.2.0-alpha</span>
                </div>
            </div>
        </div>
    );
}
