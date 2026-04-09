import { AnimatedProperty } from './keyframe';

export type LayerType = 
    | 'text' 
    | 'shape' 
    | 'image' 
    | 'video' 
    | 'solid' 
    | 'null' 
    | 'adjustment' 
    | 'audio' 
    | 'precomp' 
    | 'aiGenerated' 
    | 'background'
    | 'gradient'
    | 'particle';

export type BlendMode = 
    | 'normal' 
    | 'multiply' 
    | 'screen' 
    | 'overlay' 
    | 'darken' 
    | 'lighten' 
    | 'colorDodge' 
    | 'colorBurn' 
    | 'hardLight' 
    | 'softLight' 
    | 'difference' 
    | 'exclusion' 
    | 'hue' 
    | 'saturation' 
    | 'color' 
    | 'luminosity'
    | 'add';

export type TrackMatte = 'none' | 'alpha' | 'alphaInverted' | 'luma' | 'lumaInverted';

export interface Transform {
    position: AnimatedProperty<{ x: number; y: number }>;
    scale: AnimatedProperty<{ x: number; y: number }>; // in percent (100 = 1x)
    rotation: AnimatedProperty<number>; // in degrees
    opacity: AnimatedProperty<number>; // 0 to 100
    anchorPoint: AnimatedProperty<{ x: number; y: number }>;
    skew: AnimatedProperty<number>;
    skewAxis: AnimatedProperty<number>;
}

export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    
    // Timing (all in frames)
    inPoint: number; // when the layer starts existing visually
    outPoint: number; // when it stops existing
    startTime: number; // offset within the comp timeline
    
    // Hierarchy & Visibility
    parentId: string | null;
    visible: boolean;
    locked: boolean;
    shy: boolean;
    solo: boolean;
    
    // UI Label
    colorLabel: string; // e.g., '#f87171'
    
    // Compositing
    blendMode: BlendMode;
    trackMatte: TrackMatte;
    
    // Core animatable properties
    transform: Transform;
    
    // Extensibility
    effects: string[]; // references effect ids
    masks: string[]; // references mask ids
    
    // Type-specific data (can be refined in specialized interfaces)
    data: any; 
}

// Specialized Layer Data Types

export interface TextLayerData {
    content: string; // This could also be animated in a full AE clone (Source Text)
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
}

export interface SolidLayerData {
    color: string;
    width: number;
    height: number;
}

export interface ImageLayerData {
    src: string;
    alt?: string;
}

export interface VideoLayerData {
    src: string;
    volume: AnimatedProperty<number>;
    muted: boolean;
}

export interface ShapeLayerData {
    shapeType: 'rectangle' | 'ellipse' | 'path';
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius?: number; // for rectangle
}

export interface GradientLayerData {
    gradientType: 'linear' | 'radial' | 'conic';
    colors: { color: string; stop: number }[]; // stop 0-100
    angle: number; // degrees, for linear
    width: number;
    height: number;
}

export interface ParticleLayerData {
    count: number;          // number of particles
    size: number;           // px
    sizeVariance: number;   // 0-1
    speed: number;          // px/frame
    color: string;
    colorEnd?: string;      // gradient end color
    shape: 'circle' | 'square' | 'star';
    spawnX: number;         // 0-1 relative to canvas
    spawnY: number;
    spread: number;         // 0-360 deg spread cone
    gravity: number;        // px/frame² downward pull
    life: number;           // frames per particle
    opacity: number;        // 0-100
    blurRadius: number;     // px
}
