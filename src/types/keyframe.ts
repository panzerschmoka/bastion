export type InterpolationType = 'linear' | 'easeIn' | 'easeOut' | 'bezier' | 'hold';

export interface Keyframe<T> {
    id: string;
    time: number; // in frames
    value: T;
    interpolation: InterpolationType;
    inTangent?: { x: number; y: number }; // for bezier
    outTangent?: { x: number; y: number }; // for bezier
}

export interface AnimatedProperty<T> {
    isAnimated: boolean;
    keyframes: Keyframe<T>[];
    value: T; // current static value if not animated
}

// Helper to create a new property
export function createAnimatedProperty<T>(initialValue: T): AnimatedProperty<T> {
    return {
        isAnimated: false,
        keyframes: [],
        value: initialValue
    };
}
