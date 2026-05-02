// JewelFit Types & Presets

/**
 * Material Presets based on research paper specifications
 * Gold: metalness = 1.0, roughness = 0.30
 * Rose Gold: metalness = 0.9, roughness = 0.35
 * Platinum: metalness = 1.0, roughness = 0.15
 * Silver: metalness = 0.95, roughness = 0.25
 */
export const METAL_PRESETS = [
    { name: 'Gold', color: '#FFD700', roughness: 0.30, metalness: 1.0 },
    { name: 'Rose Gold', color: '#B76E79', roughness: 0.35, metalness: 0.9 },
    { name: 'Platinum', color: '#E5E4E2', roughness: 0.15, metalness: 1.0 },
    { name: 'Silver', color: '#C0C0C0', roughness: 0.25, metalness: 0.95 },
] as const;

/**
 * HDRI Environment Lighting Presets
 * Studio: Professional studio lighting with soft shadows
 * Daylight: Natural outdoor lighting
 * Indoor: Interior ambient lighting
 */
export const LIGHTING_PRESETS = [
    { name: 'Studio', preset: 'studio', intensity: 1.5, position: [5, 5, 5] },
    { name: 'Daylight', preset: 'sunset', intensity: 1.2, position: [10, 10, 5] },
    { name: 'Indoor', preset: 'apartment', intensity: 0.8, position: [2, 3, 2] }
] as const;

export type MetalPreset = typeof METAL_PRESETS[number];
export type LightingPreset = typeof LIGHTING_PRESETS[number];
