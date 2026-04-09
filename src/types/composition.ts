export interface CompositionSettings {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    backgroundColor: string;
}

export interface Composition extends CompositionSettings {
    id: string;
    name: string;
    layers: string[]; // references to layer ids
    parentCompId?: string; // if this is a precomp inside another comp
}

// Preset options for common formats
export const COMPOSITION_PRESETS = {
    YOUTUBE_1080: { width: 1920, height: 1080, fps: 30 },
    YOUTUBE_4K: { width: 3840, height: 2160, fps: 60 },
    INSTAGRAM_POST: { width: 1080, height: 1080, fps: 30 },
    INSTAGRAM_REEL: { width: 1080, height: 1920, fps: 30 },
    TIKTOK: { width: 1080, height: 1920, fps: 60 },
} as const;
