import { MetalPreset } from '@jewelfit/types';

interface MaterialEditorProps {
    material: {
        baseColor: string;
        metalness: number;
        roughness: number;
    };
    onMaterialChange: (material: any) => void;
    metalPresets: MetalPreset[];
    onPresetSelect: (preset: MetalPreset) => void;
}

export default function MaterialEditor({
    material,
    onMaterialChange,
    metalPresets,
    onPresetSelect,
}: MaterialEditorProps) {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Material Editor</h3>

            {/* Metal Presets */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Metal Presets</label>
                <div className="grid grid-cols-2 gap-2">
                    {metalPresets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => onPresetSelect(preset)}
                            className="p-3 rounded-lg border-2 border-white/20 hover:border-primary-500 transition-all"
                            style={{
                                background: `linear-gradient(135deg, ${preset.baseColor}40, ${preset.baseColor}20)`,
                            }}
                        >
                            <div className="text-sm font-semibold">{preset.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Controls */}
            <div className="space-y-4">
                {/* Base Color */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Base Color
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={material.baseColor}
                            onChange={(e) =>
                                onMaterialChange({ ...material, baseColor: e.target.value })
                            }
                            className="w-12 h-12 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={material.baseColor}
                            onChange={(e) =>
                                onMaterialChange({ ...material, baseColor: e.target.value })
                            }
                            className="input-field flex-1 py-2"
                        />
                    </div>
                </div>

                {/* Metalness */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Metalness: {material.metalness.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={material.metalness}
                        onChange={(e) =>
                            onMaterialChange({
                                ...material,
                                metalness: parseFloat(e.target.value),
                            })
                        }
                        className="w-full"
                    />
                </div>

                {/* Roughness */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Roughness: {material.roughness.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={material.roughness}
                        onChange={(e) =>
                            onMaterialChange({
                                ...material,
                                roughness: parseFloat(e.target.value),
                            })
                        }
                        className="w-full"
                    />
                </div>
            </div>

            <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                💡 Adjust metalness and roughness to achieve different finishes from polished to matte
            </div>
        </div>
    );
}
