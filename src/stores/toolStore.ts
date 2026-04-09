import { create } from "zustand";

type ToolType = "selection" | "hand" | "zoom" | "type" | "shape" | "image" | "video";

interface ToolState {
    activeTool: ToolType;
    setTool: (tool: ToolType) => void;
}

export const useToolStore = create<ToolState>()((set) => ({
    activeTool: "selection",
    setTool: (tool) => set({ activeTool: tool }),
}));
