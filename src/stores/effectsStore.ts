import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Effect } from "@/types/effect";
import { nanoid } from "nanoid";

interface EffectsState {
    effects: Record<string, Effect>;
}

interface EffectsActions {
    addEffect: (type: string, name: string, initialProperties?: Record<string, any>) => string;
    removeEffect: (id: string) => void;
    updateEffectProperty: (id: string, propertyName: string, value: any) => void;
    toggleEffect: (id: string) => void;
}

const initialState: EffectsState = {
    effects: {},
};

export const useEffectsStore = create<EffectsState & EffectsActions>()(
    devtools(
        persist(
            immer((set) => ({
                ...initialState,
                
                addEffect: (type, name, initialProperties = {}) => {
                    const id = nanoid();
                    const newEffect: Effect = {
                        id,
                        type,
                        name,
                        enabled: true,
                        order: 0, // Should be managed by layer effects array order
                        properties: initialProperties,
                    };
                    
                    set((s) => {
                        s.effects[id] = newEffect;
                    });
                    
                    // NOTE: Caller must push this `id` into the target layer's `effects` array!
                    return id;
                },
                
                removeEffect: (id) => set((s) => {
                    delete s.effects[id];
                    // NOTE: Caller must remove this `id` from the target layer's `effects` array!
                }),
                
                updateEffectProperty: (id, propertyName, value) => set((s) => {
                    const effect = s.effects[id];
                    if (effect) {
                        // For a robust system, this should support AnimatedProperty too,
                        // but here we just update the simple JS value.
                        effect.properties[propertyName] = value;
                    }
                }),
                
                toggleEffect: (id) => set((s) => {
                    const effect = s.effects[id];
                    if (effect) {
                        effect.enabled = !effect.enabled;
                    }
                })
            })),
            { name: "motionai-effects" }
        ),
        { name: "EffectsStore" }
    )
);
