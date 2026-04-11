// JewelFit Types & Presets

export const METAL_PRESETS = [
    { name: 'Gold', color: '#FFD700', roughness: 0.2, metalness: 1 },
    { name: 'Silver', color: '#C0C0C0', roughness: 0.25, metalness: 1 },
    { name: 'Platinum', color: '#E5E4E2', roughness: 0.15, metalness: 1 }
] as const;

export const LIGHTING_PRESETS = [
    { name: 'Studio', intensity: 1.5, position: [5, 5, 5] },
    { name: 'Soft', intensity: 0.8, position: [2, 3, 2] },
    { name: 'Spotlight', intensity: 2, position: [0, 5, 0] }
] as const;

export type MetalPreset = typeof METAL_PRESETS[number];
export type LightingPreset = typeof LIGHTING_PRESETS[number];
