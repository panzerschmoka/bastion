"use client";

import { EditorHeader } from "@/features/editor/components/EditorHeader";
import { Toolbar } from "@/features/editor/components/Toolbar";
import { Canvas } from "@/features/editor/components/Canvas";
import { PropertiesPanel } from "@/features/editor/components/PropertiesPanel";
import { Timeline } from "@/features/editor/components/Timeline";

export default function EditorPage() {
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Top Header Bar */}
            <EditorHeader />

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Toolbar */}
                <Toolbar />

                {/* Center: Canvas + Timeline */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Canvas */}
                    <Canvas />

                    {/* Timeline */}
                    <Timeline />
                </div>

                {/* Right: Properties Panel */}
                <PropertiesPanel />
            </div>
        </div>
    );
}
