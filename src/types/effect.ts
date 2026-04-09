// Effect categories similar to AE
export type EffectCategory = 
    | 'blur' 
    | 'color' 
    | 'distort' 
    | 'generate' 
    | 'stylize' 
    | 'time' 
    | 'transition';

export interface Effect {
    id: string;
    type: string; // e.g., 'gaussianBlur', 'dropShadow'
    name: string; // display name
    enabled: boolean;
    order: number; // index in effect stack
    
    // Properties as a flexible record — values can be numbers, strings, booleans
    properties: Record<string, any>; 
}

// Definition of what an effect requires
export interface EffectParameterDef {
    id: string;
    name: string;
    type: 'number' | 'color' | 'boolean' | 'select' | 'point';
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    options?: { label: string; value: string | number }[]; // for 'select'
}

export interface EffectDefinition {
    id: string;
    name: string;
    category: EffectCategory;
    parameters: EffectParameterDef[];
}

// ─── Built-in Effect Library ───

export const EFFECT_LIBRARY: EffectDefinition[] = [
    {
        id: 'gaussianBlur',
        name: 'Gaussian Blur',
        category: 'blur',
        parameters: [
            { id: 'radius', name: 'Radius', type: 'number', defaultValue: 5, min: 0, max: 100, step: 0.5 },
            { id: 'direction', name: 'Direction', type: 'select', defaultValue: 'both', 
              options: [{ label: 'Both', value: 'both' }, { label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
        ],
    },
    {
        id: 'glow',
        name: 'Glow',
        category: 'stylize',
        parameters: [
            { id: 'radius', name: 'Radius', type: 'number', defaultValue: 10, min: 0, max: 60, step: 1 },
            { id: 'intensity', name: 'Intensity', type: 'number', defaultValue: 50, min: 0, max: 100, step: 1 },
            { id: 'color', name: 'Color', type: 'color', defaultValue: '#6366f1' },
        ],
    },
    {
        id: 'dropShadow',
        name: 'Drop Shadow',
        category: 'stylize',
        parameters: [
            { id: 'offsetX', name: 'Offset X', type: 'number', defaultValue: 4, min: -100, max: 100, step: 1 },
            { id: 'offsetY', name: 'Offset Y', type: 'number', defaultValue: 4, min: -100, max: 100, step: 1 },
            { id: 'blur', name: 'Blur', type: 'number', defaultValue: 8, min: 0, max: 100, step: 1 },
            { id: 'color', name: 'Color', type: 'color', defaultValue: '#000000' },
            { id: 'opacity', name: 'Opacity', type: 'number', defaultValue: 60, min: 0, max: 100, step: 1 },
        ],
    },
    {
        id: 'colorCorrection',
        name: 'Color Correction',
        category: 'color',
        parameters: [
            { id: 'brightness', name: 'Brightness', type: 'number', defaultValue: 0, min: -100, max: 100, step: 1 },
            { id: 'contrast', name: 'Contrast', type: 'number', defaultValue: 0, min: -100, max: 100, step: 1 },
            { id: 'saturation', name: 'Saturation', type: 'number', defaultValue: 100, min: 0, max: 200, step: 1 },
            { id: 'hueRotate', name: 'Hue Rotate', type: 'number', defaultValue: 0, min: 0, max: 360, step: 1 },
        ],
    },
    {
        id: 'vignette',
        name: 'Vignette',
        category: 'stylize',
        parameters: [
            { id: 'radius', name: 'Radius', type: 'number', defaultValue: 70, min: 0, max: 100, step: 1 },
            { id: 'softness', name: 'Softness', type: 'number', defaultValue: 50, min: 0, max: 100, step: 1 },
            { id: 'opacity', name: 'Opacity', type: 'number', defaultValue: 40, min: 0, max: 100, step: 1 },
        ],
    },
];

/** Create default property values for a given effect definition */
export function createEffectDefaults(def: EffectDefinition): Record<string, any> {
    const props: Record<string, any> = {};
    for (const p of def.parameters) {
        props[p.id] = p.defaultValue;
    }
    return props;
}
