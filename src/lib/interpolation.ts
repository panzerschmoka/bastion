import { AnimatedProperty, Keyframe } from "@/types/keyframe";

/**
 * Interpolation engine — resolves the value of an AnimatedProperty 
 * at a given frame by linearly interpolating between keyframes.
 */

/** Lerp between two numbers */
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/** Ease functions */
function easeIn(t: number): number {
    return t * t;
}

function easeOut(t: number): number {
    return 1 - (1 - t) * (1 - t);
}

function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function applyEasing(t: number, interpolation: string): number {
    switch (interpolation) {
        case "easeIn": return easeIn(t);
        case "easeOut": return easeOut(t);
        case "bezier": return easeInOut(t);
        case "hold": return 0; // don't interpolate
        case "linear":
        default: return t;
    }
}

/** Interpolate a numeric value between two keyframes */
function interpolateNumber(a: number, b: number, t: number): number {
    return lerp(a, b, t);
}

/** Deep interpolate any value — handles numbers, {x,y} objects, and falls back to step */
function interpolateValue<T>(from: T, to: T, t: number): T {
    if (typeof from === "number" && typeof to === "number") {
        return interpolateNumber(from as number, to as number, t) as T;
    }

    // Handle { x, y } position/scale objects
    if (
        typeof from === "object" && from !== null &&
        typeof to === "object" && to !== null &&
        "x" in from && "y" in from &&
        "x" in to && "y" in to
    ) {
        const fObj = from as { x: number; y: number };
        const tObj = to as { x: number; y: number };
        return {
            x: lerp(fObj.x, tObj.x, t),
            y: lerp(fObj.y, tObj.y, t),
        } as T;
    }

    // Fallback: step (return 'from' if t < 1, else 'to')
    return t < 1 ? from : to;
}

/**
 * Resolve the value of an AnimatedProperty at a given frame.
 * Performs smooth interpolation between keyframes based on interpolation type.
 */
export function resolveProperty<T>(prop: AnimatedProperty<T>, frame: number): T {
    // Not animated — return static value
    if (!prop.isAnimated || prop.keyframes.length === 0) {
        return prop.value;
    }

    const sorted = [...prop.keyframes].sort((a, b) => a.time - b.time);

    // Before first keyframe
    if (frame <= sorted[0].time) {
        return sorted[0].value;
    }

    // After last keyframe
    if (frame >= sorted[sorted.length - 1].time) {
        return sorted[sorted.length - 1].value;
    }

    // Find surrounding keyframes
    for (let i = 0; i < sorted.length - 1; i++) {
        const kfA = sorted[i];
        const kfB = sorted[i + 1];

        if (frame >= kfA.time && frame <= kfB.time) {
            const duration = kfB.time - kfA.time;
            if (duration === 0) return kfA.value;

            const rawT = (frame - kfA.time) / duration;
            const easedT = applyEasing(rawT, kfA.interpolation);

            if (kfA.interpolation === "hold") {
                return kfA.value;
            }

            return interpolateValue(kfA.value, kfB.value, easedT);
        }
    }

    return sorted[sorted.length - 1].value;
}
