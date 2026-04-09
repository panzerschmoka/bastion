import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import { Effect, EFFECT_LIBRARY, createEffectDefaults } from "@/types/effect";
import { useLayerStore } from "./layerStore";

interface EffectState {
    effects: Record<string, Effect>; // effectId -> Effect
}

interface EffectActions {
    /** Add an effect to a layer by effectDefinitionId (e.g., "gaussianBlur") */
    addEffect: (layerId: string, effectDefId: string) => string | null;
    /** Remove effect by id */
    removeEffect: (layerId: string, effectId: string) => void;
    /** Toggle effect enabled/disabled */
    toggleEffect: (effectId: string) => void;
    /** Update a property on an effect */
    updateEffectProperty: (effectId: string, propertyId: string, value: any) => void;
    /** Reorder effects for a layer */
    reorderEffect: (layerId: string, effectId: string, newIndex: number) => void;
    /** Duplicate an effect */
    duplicateEffect: (layerId: string, effectId: string) => string | null;
}

const initialState: EffectState = {
    effects: {},
};

export const useEffectStore = create<EffectState & EffectActions>()(
    devtools(
        immer((set, get) => ({
            ...initialState,

            addEffect: (layerId, effectDefId) => {
                const def = EFFECT_LIBRARY.find(d => d.id === effectDefId);
                if (!def) return null;

                const effectId = nanoid();
                const effect: Effect = {
                    id: effectId,
                    type: def.id,
                    name: def.name,
                    enabled: true,
                    order: 0,
                    properties: createEffectDefaults(def),
                };

                set((s) => {
                    s.effects[effectId] = effect;
                });

                // Add effect ref to the layer
                useLayerStore.setState((s) => {
                    const layer = s.layers[layerId];
                    if (layer) {
                        effect.order = layer.effects.length;
                        layer.effects.push(effectId);
                    }
                });

                return effectId;
            },

            removeEffect: (layerId, effectId) => {
                set((s) => {
                    delete s.effects[effectId];
                });
                useLayerStore.setState((s) => {
                    const layer = s.layers[layerId];
                    if (layer) {
                        layer.effects = layer.effects.filter(id => id !== effectId);
                    }
                });
            },

            toggleEffect: (effectId) => {
                set((s) => {
                    const eff = s.effects[effectId];
                    if (eff) eff.enabled = !eff.enabled;
                });
            },

            updateEffectProperty: (effectId, propertyId, value) => {
                set((s) => {
                    const eff = s.effects[effectId];
                    if (eff) {
                        eff.properties[propertyId] = value;
                    }
                });
            },

            reorderEffect: (layerId, effectId, newIndex) => {
                useLayerStore.setState((s) => {
                    const layer = s.layers[layerId];
                    if (!layer) return;
                    const idx = layer.effects.indexOf(effectId);
                    if (idx < 0) return;
                    layer.effects.splice(idx, 1);
                    layer.effects.splice(newIndex, 0, effectId);
                });
            },

            duplicateEffect: (layerId, effectId) => {
                const eff = get().effects[effectId];
                if (!eff) return null;
                const newId = nanoid();
                const newEff: Effect = {
                    ...JSON.parse(JSON.stringify(eff)),
                    id: newId,
                    name: `${eff.name} (Copy)`,
                };
                set((s) => {
                    s.effects[newId] = newEff;
                });
                useLayerStore.setState((s) => {
                    const layer = s.layers[layerId];
                    if (layer) {
                        layer.effects.push(newId);
                    }
                });
                return newId;
            },
        })),
        { name: "EffectStore" }
    )
);
