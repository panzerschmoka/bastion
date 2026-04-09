import { AnimatedProperty, Keyframe, InterpolationType } from "@/types/keyframe";
import { Transform } from "@/types/layer";
import { createAnimatedProperty } from "@/types/keyframe";
import { nanoid } from "nanoid";

// ─── Helpers ───

function kf<T>(time: number, value: T, interp: InterpolationType = "linear"): Keyframe<T> {
    return { id: nanoid(), time, value, interpolation: interp };
}

function animProp<T>(keyframes: Keyframe<T>[], staticVal: T): AnimatedProperty<T> {
    return { isAnimated: keyframes.length > 0, keyframes, value: staticVal };
}

function defaultTransform(x: number, y: number): Transform {
    return {
        position: createAnimatedProperty({ x, y }),
        scale: createAnimatedProperty({ x: 100, y: 100 }),
        rotation: createAnimatedProperty(0),
        opacity: createAnimatedProperty(100),
        anchorPoint: createAnimatedProperty({ x: 0, y: 0 }),
        skew: createAnimatedProperty(0),
        skewAxis: createAnimatedProperty(0),
    };
}

// ─── Animation Data from AI ───

export interface AIAnimation {
    type?: string;
    speed?: number;
    intensity?: number;
    direction?: string;
    delay?: number;
}

// ─── Main Export ───

export function createAnimatedTransform(opts: {
    type: string;
    x: number;
    y: number;
    inPoint: number;
    outPoint: number;
    elementIndex: number;
    totalElements: number;
    animation?: AIAnimation;
}): Transform {
    const { x, y, inPoint, outPoint, elementIndex, totalElements, animation } = opts;
    
    const animType = animation?.type || "float";
    const speed = Math.max(0.1, Math.min(3, animation?.speed || 1));
    const intensity = Math.max(0.1, Math.min(3, animation?.intensity || 1));
    const dir = animation?.direction || "cw";
    const delay = Math.max(0, animation?.delay || elementIndex * 3);
    
    const duration = outPoint - inPoint;
    const start = inPoint + delay;
    const end = outPoint;
    
    // Common fade in/out for all animations
    const fadeIn = Math.min(12, duration * 0.1);
    const fadeOut = Math.min(12, duration * 0.1);
    const opacityKfs = [
        kf(start, 0, "easeOut"),
        kf(start + fadeIn, 100, "easeOut"),
        kf(end - fadeOut, 100, "easeIn"),
        kf(end, 0, "easeIn"),
    ];
    
    const base = defaultTransform(x, y);
    base.opacity = animProp(opacityKfs, 100);
    
    switch (animType) {
        case "orbit": return orbit(base, x, y, start, end, speed, intensity, dir, elementIndex, totalElements);
        case "spiral": return spiral(base, x, y, start, end, speed, intensity, dir, elementIndex);
        case "vortex": return vortex(base, x, y, start, end, speed, intensity, dir, elementIndex);
        case "float": return float(base, x, y, start, end, speed, intensity);
        case "zoom": return zoom(base, x, y, start, end, speed, intensity, dir);
        case "slide": return slide(base, x, y, start, end, speed, intensity, dir);
        case "rotate": return rotate(base, x, y, start, end, speed, intensity, dir);
        case "pulse": return pulse(base, x, y, start, end, speed, intensity);
        case "shake": return shake(base, x, y, start, end, speed, intensity);
        case "bounce": return bounce(base, x, y, start, end, speed, intensity, dir);
        case "wave": return wave(base, x, y, start, end, speed, intensity, dir, elementIndex);
        case "explode": return explode(base, x, y, start, end, speed, intensity, elementIndex, totalElements);
        case "converge": return converge(base, x, y, start, end, speed, intensity, elementIndex, totalElements);
        case "scatter": return scatter(base, x, y, start, end, speed, intensity, elementIndex);
        case "pendulum": return pendulum(base, x, y, start, end, speed, intensity);
        case "none": return base;
        default: return float(base, x, y, start, end, speed, intensity);
    }
}

// ─── 16 Animation Implementations ───

function orbit(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string, idx: number, total: number): Transform {
    const radius = 120 * intensity;
    const angleOffset = (idx / Math.max(total, 1)) * Math.PI * 2;
    const direction = dir === "ccw" ? -1 : 1;
    const steps = Math.max(4, Math.floor((end - start) / (15 / speed)));
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        const angle = angleOffset + direction * t2 * Math.PI * 2 * speed;
        const frame = Math.round(start + t2 * (end - start));
        posKfs.push(kf(frame, {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
        }, "bezier"));
    }
    
    t.position = animProp(posKfs, { x, y });
    t.rotation = animProp([
        kf(start, 0, "linear"),
        kf(end, direction * 360 * speed, "linear"),
    ], 0);
    t.scale = animProp([
        kf(start, { x: 70, y: 70 }, "easeOut"),
        kf(start + (end - start) * 0.3, { x: 100 + intensity * 10, y: 100 + intensity * 10 }, "bezier"),
        kf(end, { x: 90, y: 90 }, "easeIn"),
    ], { x: 100, y: 100 });
    return t;
}

function spiral(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string, idx: number): Transform {
    const direction = dir === "ccw" ? -1 : 1;
    const steps = Math.max(6, Math.floor((end - start) / (10 / speed)));
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        const radius = (1 - t2) * 200 * intensity;
        const angle = t2 * Math.PI * 4 * speed * direction + idx * 0.8;
        const frame = Math.round(start + t2 * (end - start));
        posKfs.push(kf(frame, {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
        }, "bezier"));
    }
    
    t.position = animProp(posKfs, { x, y });
    t.rotation = animProp([
        kf(start, direction * -180, "linear"),
        kf(end, direction * 360 * speed, "linear"),
    ], 0);
    return t;
}

function vortex(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string, idx: number): Transform {
    const cx = 960, cy = 540; // center of canvas
    const direction = dir === "ccw" ? -1 : 1;
    const steps = Math.max(8, Math.floor((end - start) / (8 / speed)));
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        const distFactor = 1 - t2 * 0.8; // converge toward center
        const angle = t2 * Math.PI * 6 * speed * direction + idx * 1.2;
        const dx = (x - cx) * distFactor;
        const dy = (y - cy) * distFactor;
        const rx = Math.cos(angle) * 40 * intensity * distFactor;
        const ry = Math.sin(angle) * 40 * intensity * distFactor;
        const frame = Math.round(start + t2 * (end - start));
        posKfs.push(kf(frame, { x: cx + dx + rx, y: cy + dy + ry }, "bezier"));
    }
    
    t.position = animProp(posKfs, { x, y });
    t.rotation = animProp([
        kf(start, 0, "linear"),
        kf(end, direction * 720 * speed, "linear"),
    ], 0);
    t.scale = animProp([
        kf(start, { x: 120, y: 120 }, "easeIn"),
        kf(end, { x: 40, y: 40 }, "easeIn"),
    ], { x: 100, y: 100 });
    return t;
}

function float(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number): Transform {
    const amp = 30 * intensity;
    const mid = Math.round((start + end) / 2);
    const q1 = Math.round(start + (end - start) * 0.25);
    const q3 = Math.round(start + (end - start) * 0.75);
    
    t.position = animProp([
        kf(start, { x, y }, "bezier"),
        kf(q1, { x: x + amp * 0.3, y: y - amp }, "bezier"),
        kf(mid, { x: x - amp * 0.2, y: y + amp * 0.5 }, "bezier"),
        kf(q3, { x: x + amp * 0.5, y: y - amp * 0.7 }, "bezier"),
        kf(end, { x, y }, "bezier"),
    ], { x, y });
    t.rotation = animProp([
        kf(start, -3 * intensity, "bezier"),
        kf(mid, 3 * intensity, "bezier"),
        kf(end, -3 * intensity, "bezier"),
    ], 0);
    return t;
}

function zoom(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string): Transform {
    const fromScale = dir === "up" || dir === "cw" ? 20 : 100 + intensity * 40;
    const toScale = dir === "up" || dir === "cw" ? 100 + intensity * 20 : 20;
    
    t.position = animProp([
        kf(start, { x, y }, "easeOut"),
        kf(end, { x, y }, "easeOut"),
    ], { x, y });
    t.scale = animProp([
        kf(start, { x: fromScale, y: fromScale }, "easeOut"),
        kf(end, { x: toScale, y: toScale }, "easeIn"),
    ], { x: 100, y: 100 });
    t.rotation = animProp([
        kf(start, dir === "ccw" ? 45 : -45, "easeOut"),
        kf(end, 0, "easeOut"),
    ], 0);
    return t;
}

function slide(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string): Transform {
    const dist = 400 * intensity;
    let fromX = x, fromY = y;
    
    switch (dir) {
        case "left": fromX = x + dist; break;
        case "right": fromX = x - dist; break;
        case "up": fromY = y + dist; break;
        case "down": fromY = y - dist; break;
        default: fromX = x - dist; break;
    }
    
    t.position = animProp([
        kf(start, { x: fromX, y: fromY }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.4 / speed), { x, y }, "easeOut"),
        kf(end, { x, y }, "linear"),
    ], { x, y });
    return t;
}

function rotate(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string): Transform {
    const direction = dir === "ccw" ? -1 : 1;
    const degrees = 360 * speed * intensity * direction;
    
    t.position = createAnimatedProperty({ x, y });
    t.rotation = animProp([
        kf(start, 0, "linear"),
        kf(end, degrees, "linear"),
    ], 0);
    t.scale = animProp([
        kf(start, { x: 80, y: 80 }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.3), { x: 105, y: 105 }, "bezier"),
        kf(end, { x: 95, y: 95 }, "easeIn"),
    ], { x: 100, y: 100 });
    return t;
}

function pulse(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number): Transform {
    const pulseCount = Math.max(2, Math.floor((end - start) / (30 / speed)));
    const scaleKfs: Keyframe<{x: number; y: number}>[] = [];
    const big = 100 + 30 * intensity;
    const small = 100 - 15 * intensity;
    
    for (let i = 0; i <= pulseCount; i++) {
        const t2 = i / pulseCount;
        const frame = Math.round(start + t2 * (end - start));
        const s = i % 2 === 0 ? big : small;
        scaleKfs.push(kf(frame, { x: s, y: s }, "bezier"));
    }
    
    t.position = createAnimatedProperty({ x, y });
    t.scale = animProp(scaleKfs, { x: 100, y: 100 });
    return t;
}

function shake(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number): Transform {
    const steps = Math.max(8, Math.floor((end - start) / (5 / speed)));
    const amp = 15 * intensity;
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        const frame = Math.round(start + t2 * (end - start));
        const jx = (Math.sin(i * 7.3) * amp) * (1 - t2 * 0.5);
        const jy = (Math.cos(i * 5.7) * amp * 0.7) * (1 - t2 * 0.5);
        posKfs.push(kf(frame, { x: x + jx, y: y + jy }, "linear"));
    }
    
    t.position = animProp(posKfs, { x, y });
    t.rotation = animProp([
        kf(start, -5 * intensity, "linear"),
        kf(Math.round(start + (end - start) * 0.25), 5 * intensity, "linear"),
        kf(Math.round(start + (end - start) * 0.5), -3 * intensity, "linear"),
        kf(Math.round(start + (end - start) * 0.75), 3 * intensity, "linear"),
        kf(end, 0, "linear"),
    ], 0);
    return t;
}

function bounce(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string): Transform {
    const bounceHeight = 200 * intensity;
    const bounces = Math.max(3, Math.floor(speed * 4));
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= bounces; i++) {
        const t2 = i / bounces;
        const frame = Math.round(start + t2 * (end - start));
        const amplitude = bounceHeight * Math.pow(0.6, i);
        const isUp = i % 2 === 0;
        const yOff = dir === "down" ? (isUp ? 0 : amplitude) : (isUp ? -amplitude : 0);
        posKfs.push(kf(frame, { x, y: y + yOff }, "easeOut"));
    }
    
    t.position = animProp(posKfs, { x, y });
    t.scale = animProp([
        kf(start, { x: 80, y: 120 }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.15), { x: 100, y: 100 }, "easeOut"),
    ], { x: 100, y: 100 });
    return t;
}

function wave(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, dir: string, idx: number): Transform {
    const steps = Math.max(6, Math.floor((end - start) / (12 / speed)));
    const amp = 60 * intensity;
    const phase = idx * 0.8;
    const posKfs: Keyframe<{x: number; y: number}>[] = [];
    
    for (let i = 0; i <= steps; i++) {
        const t2 = i / steps;
        const frame = Math.round(start + t2 * (end - start));
        const waveVal = Math.sin(t2 * Math.PI * 2 * speed + phase) * amp;
        
        if (dir === "up" || dir === "down") {
            posKfs.push(kf(frame, { x: x + waveVal, y: y + t2 * (dir === "down" ? 200 : -200) * intensity }, "bezier"));
        } else {
            posKfs.push(kf(frame, { x: x + t2 * (dir === "right" ? 200 : -200) * intensity, y: y + waveVal }, "bezier"));
        }
    }
    
    t.position = animProp(posKfs, { x, y });
    return t;
}

function explode(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, idx: number, total: number): Transform {
    const cx = 960, cy = 540;
    const angle = (idx / Math.max(total, 1)) * Math.PI * 2;
    const dist = 500 * intensity;
    
    t.position = animProp([
        kf(start, { x: cx, y: cy }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.6 / speed), {
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
        }, "easeOut"),
        kf(end, {
            x: cx + Math.cos(angle) * dist * 1.1,
            y: cy + Math.sin(angle) * dist * 1.1,
        }, "linear"),
    ], { x, y });
    t.scale = animProp([
        kf(start, { x: 0, y: 0 }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.2), { x: 130, y: 130 }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.4), { x: 100, y: 100 }, "bezier"),
    ], { x: 100, y: 100 });
    t.rotation = animProp([
        kf(start, 0, "easeOut"),
        kf(end, (idx % 2 === 0 ? 180 : -180) * speed, "linear"),
    ], 0);
    return t;
}

function converge(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, idx: number, total: number): Transform {
    const cx = 960, cy = 540;
    const angle = (idx / Math.max(total, 1)) * Math.PI * 2;
    const dist = 600 * intensity;
    
    t.position = animProp([
        kf(start, {
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
        }, "easeIn"),
        kf(Math.round(start + (end - start) * 0.7 / speed), { x, y }, "easeOut"),
        kf(end, { x, y }, "linear"),
    ], { x, y });
    t.scale = animProp([
        kf(start, { x: 40, y: 40 }, "easeIn"),
        kf(Math.round(start + (end - start) * 0.5), { x: 110, y: 110 }, "easeOut"),
        kf(end, { x: 100, y: 100 }, "bezier"),
    ], { x: 100, y: 100 });
    return t;
}

function scatter(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number, idx: number): Transform {
    const angle = idx * 2.39996; // golden angle
    const dist = 300 * intensity;
    const endX = x + Math.cos(angle) * dist;
    const endY = y + Math.sin(angle) * dist;
    
    t.position = animProp([
        kf(start, { x, y }, "easeOut"),
        kf(Math.round(start + (end - start) * 0.5 / speed), { x: endX, y: endY }, "easeOut"),
        kf(end, { x: endX + Math.cos(angle) * 40, y: endY + Math.sin(angle) * 40 }, "linear"),
    ], { x, y });
    t.rotation = animProp([
        kf(start, 0, "linear"),
        kf(end, (idx % 2 === 0 ? 90 : -90) * speed, "linear"),
    ], 0);
    return t;
}

function pendulum(t: Transform, x: number, y: number, start: number, end: number, speed: number, intensity: number): Transform {
    const swings = Math.max(3, Math.floor(speed * 4));
    const maxAngle = 30 * intensity;
    const rotKfs: Keyframe<number>[] = [];
    
    for (let i = 0; i <= swings; i++) {
        const t2 = i / swings;
        const frame = Math.round(start + t2 * (end - start));
        const decay = 1 - t2 * 0.6;
        const angle = Math.sin(t2 * Math.PI * 2 * speed) * maxAngle * decay;
        rotKfs.push(kf(frame, angle, "bezier"));
    }
    
    t.position = createAnimatedProperty({ x, y });
    t.rotation = animProp(rotKfs, 0);
    return t;
}
