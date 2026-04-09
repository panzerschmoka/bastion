import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TimelineState {
    currentTime: number; // in frames
    isPlaying: boolean;
    workAreaIn: number;
    workAreaOut: number;
    zoom: number; // timeline horizontal zoom
    snappingEnabled: boolean;
    duration: number; // cached from active composition
}

interface TimelineActions {
    setCurrentTime: (time: number) => void;
    setPlaying: (isPlaying: boolean) => void;
    setWorkArea: (inPoint: number, outPoint: number) => void;
    setZoom: (zoom: number) => void;
    toggleSnapping: () => void;
    setDuration: (duration: number) => void; // call when active comp changes
}

const initialState: TimelineState = {
    currentTime: 0,
    isPlaying: false,
    workAreaIn: 0,
    workAreaOut: 300,
    zoom: 1,
    snappingEnabled: true,
    duration: 300,
};

export const useTimelineStore = create<TimelineState & TimelineActions>()(
    devtools(
        immer((set) => ({
            ...initialState,
            
            setCurrentTime: (time) => set((s) => {
                s.currentTime = Math.max(0, Math.min(time, s.duration));
            }),
            
            setPlaying: (isPlaying) => set((s) => {
                s.isPlaying = isPlaying;
            }),
            
            setWorkArea: (inPoint, outPoint) => set((s) => {
                s.workAreaIn = Math.max(0, parseFloat(inPoint.toFixed(1)));
                s.workAreaOut = Math.min(s.duration, parseFloat(outPoint.toFixed(1)));
            }),
            
            setZoom: (zoom) => set((s) => {
                s.zoom = Math.max(0.1, Math.min(50, zoom));
            }),
            
            toggleSnapping: () => set((s) => {
                s.snappingEnabled = !s.snappingEnabled;
            }),
            
            setDuration: (duration) => set((s) => {
                s.duration = duration;
                if (s.workAreaOut > duration) s.workAreaOut = duration;
                if (s.currentTime > duration) s.currentTime = duration;
            })
        })),
        { name: "TimelineStore" }
    )
);
