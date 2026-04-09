import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Keyframe, InterpolationType } from "@/types/keyframe";
import { nanoid } from "nanoid";
import { useLayerStore } from "./layerStore"; // Needs to update specific property paths

// Instead of keeping keyframes separately, they live deeply INSIDE the AnimatedProperty
// on the actual layer or effect.
// So the keyframe store is basically an orchestration tool to mutate deep layer/effect state.

interface KeyframeActions {
    // Because keyframes are deeply nested (e.g., layer.transform.position.keyframes), 
    // it's tricky to manage them in a generic way without knowing the path.
    // So we provide helpers that take the layerId, the path to the property ("transform.position"), 
    // the time, and value.
    
    addOrUpdateKeyframe: <T>(
        layerId: string, 
        propertyPath: "transform.position" | "transform.scale" | "transform.rotation" | "transform.opacity" | "transform.anchorPoint", 
        time: number, 
        value: T, 
        interpolation?: InterpolationType
    ) => void;
    
    removeKeyframe: (layerId: string, propertyPath: string, keyframeId: string) => void;
    
    toggleAnimation: (layerId: string, propertyPath: string) => void;

    /** Update the easing/interpolation type for a specific keyframe by its ID */
    updateKeyframeEasing: (layerId: string, propertyPath: string, keyframeId: string, interpolation: InterpolationType) => void;
}

export const useKeyframeStore = create<KeyframeActions>()(
    devtools(
        (set, get) => ({
            addOrUpdateKeyframe: (layerId, propertyPath, time, value, interpolation = 'linear') => {
                // Mutates the layer store
                useLayerStore.setState((state) => {
                    const layer = state.layers[layerId];
                    if (!layer) return;
                    
                    // Ugly but necessary path traversal tailored to transform for now
                    const keys = propertyPath.split('.');
                    let target: any = layer;
                    for (const key of keys) {
                        target = target[key];
                    }
                    
                    const prop = target as import("@/types/keyframe").AnimatedProperty<any>;
                    
                    if (!prop.isAnimated) {
                        // If not animated, we don't add keyframes, we just update the static value.
                        prop.value = value;
                        return;
                    }
                    
                    // Check if keyframe exists at this exact time
                    const existingIdx = prop.keyframes.findIndex(kf => kf.time === time);
                    
                    if (existingIdx >= 0) {
                        prop.keyframes[existingIdx].value = value;
                        if (interpolation) prop.keyframes[existingIdx].interpolation = interpolation;
                    } else {
                        prop.keyframes.push({
                            id: nanoid(),
                            time,
                            value,
                            interpolation
                        });
                        // Sort by time
                        prop.keyframes.sort((a, b) => a.time - b.time);
                    }
                });
            },
            
            removeKeyframe: (layerId, propertyPath, keyframeId) => {
                useLayerStore.setState((state) => {
                    const layer = state.layers[layerId];
                    if (!layer) return;
                    
                    const keys = propertyPath.split('.');
                    let target: any = layer;
                    for (const key of keys) {
                        target = target[key];
                    }
                    
                    const prop = target as import("@/types/keyframe").AnimatedProperty<any>;
                    if (!prop.isAnimated) return;
                    
                    prop.keyframes = prop.keyframes.filter(kf => kf.id !== keyframeId);
                });
            },
            
            toggleAnimation: (layerId, propertyPath) => {
                useLayerStore.setState((state) => {
                    const layer = state.layers[layerId];
                    if (!layer) return;
                    
                    const keys = propertyPath.split('.');
                    let target: any = layer;
                    for (const key of keys) {
                        target = target[key];
                    }
                    
                    const prop = target as import("@/types/keyframe").AnimatedProperty<any>;
                    prop.isAnimated = !prop.isAnimated;
                    
                    // If turning off animation, clear keyframes
                    if (!prop.isAnimated) {
                        prop.keyframes = [];
                    }
                });
            },

            updateKeyframeEasing: (layerId, propertyPath, keyframeId, interpolation) => {
                useLayerStore.setState((state) => {
                    const layer = state.layers[layerId];
                    if (!layer) return;
                    
                    const keys = propertyPath.split('.');
                    let target: any = layer;
                    for (const key of keys) {
                        target = target[key];
                    }
                    
                    const prop = target as import("@/types/keyframe").AnimatedProperty<any>;
                    if (!prop.isAnimated) return;
                    
                    const kf = prop.keyframes.find(k => k.id === keyframeId);
                    if (kf) {
                        kf.interpolation = interpolation;
                    }
                });
            }
        }),
        { name: "KeyframeStore" }
    )
);
