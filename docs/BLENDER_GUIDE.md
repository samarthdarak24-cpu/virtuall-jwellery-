# Blender Export Guide for JewelFit 3D

This guide explains how to properly export jewelry models from Blender for use in JewelFit 3D.

## Prerequisites

- Blender 3.0 or higher
- Basic knowledge of Blender modeling
- Understanding of PBR materials

## Step 1: Model Preparation

### Scale & Units
1. Set Blender units to **Metric**
   - Scene Properties → Units → Unit System: Metric
2. Model at **real-world scale**
   - Necklace: ~40-50cm length
   - Earring: ~1-3cm
   - Ring: ~1.8cm diameter

### Geometry
- Keep polygon count **< 50,000 triangles**
- Use **quads** where possible
- Apply all modifiers before export
- Remove doubles (Mesh → Clean Up → Merge by Distance)

### Normals
- Recalculate normals (Alt+N → Recalculate Outside)
- Use Auto Smooth (Object Data Properties → Normals → Auto Smooth)
- Angle: 30°

## Step 2: Create Anchor Points

Anchors are empty objects that define where jewelry attaches to the body.

### Add Anchors
1. Add → Empty → Plain Axes
2. Name according to jewelry type:

**Earrings**:
- `ear_lobe_L` (left ear)
- `ear_lobe_R` (right ear)

**Necklace**:
- `neck_anchor` (center of necklace)

**Ring**:
- `finger_0_L` through `finger_4_L` (left hand, thumb to pinky)
- `finger_0_R` through `finger_4_R` (right hand)

### Position Anchors
- Place at the **attachment point** of the jewelry
- For earrings: at the post/hook
- For necklace: at the clasp or center back
- For rings: at the center of the band

### Hierarchy
```
Collection
├── Jewelry_Mesh
├── ear_lobe_L (Empty)
└── ear_lobe_R (Empty)
```

## Step 3: Materials & Textures

### PBR Material Setup

1. **Create Material**
   - Select mesh → Material Properties → New
   - Name: "Gold_Material"

2. **Add Texture Nodes**
   - Shader Editor → Add → Texture → Image Texture
   - Connect to Principled BSDF

3. **Configure Channels**:

**Base Color**:
- Image Texture → Base Color
- sRGB color space

**Normal Map**:
- Image Texture → Normal Map node → Normal
- Non-Color data

**Metallic/Roughness**:
- Image Texture → Separate RGB
  - R channel → Metallic
  - G channel → Roughness
- Non-Color data

### Bake Ambient Occlusion

1. Add new Image Texture node (don't connect)
2. Create new image: 2048x2048, name "AO"
3. Select AO node (make active)
4. Render Properties → Bake
   - Bake Type: Ambient Occlusion
   - Distance: 0.1m
   - Samples: 128
5. Bake → Save image

### Material Presets

**Gold (24K)**:
```
Base Color: #FFD700
Metallic: 1.0
Roughness: 0.2
```

**Rose Gold**:
```
Base Color: #B76E79
Metallic: 1.0
Roughness: 0.2
```

**Silver**:
```
Base Color: #C0C0C0
Metallic: 1.0
Roughness: 0.25
```

**Platinum**:
```
Base Color: #E5E4E2
Metallic: 1.0
Roughness: 0.1
```

## Step 4: UV Unwrapping

### Unwrap Model
1. Select mesh → Tab (Edit Mode)
2. Select all (A)
3. U → Smart UV Project
   - Angle Limit: 66°
   - Island Margin: 0.02

### Optimize UVs
- Minimize seams on visible areas
- Use UV → Pack Islands for efficient space usage
- Check for overlapping UVs

## Step 5: Export Settings

### File → Export → glTF 2.0

**Include**:
- [x] Selected Objects (or visible objects)
- [x] Custom Properties
- [x] Cameras (optional)
- [x] Punctual Lights (optional)

**Transform**:
- [x] +Y Up
- Scale: 1.0

**Geometry**:
- [x] Apply Modifiers
- [x] UVs
- [x] Normals
- [x] Tangents
- [x] Vertex Colors (if used)

**Materials**:
- [x] Export
- Images: Automatic
- [x] Compression

**Animation**:
- [ ] (Uncheck unless needed)

**Format**:
- glTF Binary (.glb) - **Recommended**
- OR glTF Separate (.gltf + .bin + textures)

### File Naming
```
necklace_emerald.glb
earring_diamond_stud.glb
ring_solitaire_platinum.glb
```

## Step 6: Texture Export

Export textures separately for better control:

1. **Base Color**:
   - UV Editor → Image → Save As
   - Format: PNG
   - Name: `product_basecolor.png`

2. **Normal Map**:
   - Format: PNG
   - Name: `product_normal.png`

3. **Metallic/Roughness**:
   - Format: PNG
   - Name: `product_metalrough.png`

4. **Ambient Occlusion**:
   - Format: PNG
   - Name: `product_ao.png`

## Common Issues & Solutions

### Model appears black
- **Check normals**: Recalculate outside
- **Verify materials**: Ensure textures are connected
- **Check lighting**: Add lights in Blender to test

### Textures don't export
- **Embed textures**: Export settings → Images: Automatic
- **Check paths**: Textures must be saved in Blender
- **Use relative paths**: File → External Data → Make Paths Relative

### Model is too large/small
- **Check scale**: Apply scale (Ctrl+A → Scale)
- **Verify units**: Scene Properties → Units
- **Measure in Blender**: Use Measure tool

### Anchors missing in export
- **Check naming**: Must be exact (case-sensitive)
- **Verify selection**: Ensure anchors are selected for export
- **Check hierarchy**: Anchors should be at root level

## Optimization Tips

### Reduce Polygon Count
1. Modifiers → Decimate
   - Ratio: 0.5 (reduces by 50%)
   - Preview before applying

2. Use Subdivision Surface wisely
   - Render levels: 2
   - Viewport levels: 1

### Texture Optimization
- Use 2048x2048 for hero products
- Use 1024x1024 for standard products
- Use 512x512 for small items
- Compress with tools like TinyPNG

### Material Optimization
- Combine materials where possible
- Use texture atlases for multiple objects
- Remove unused material slots

## Quality Checklist

Before export, verify:
- [ ] Model is at correct scale
- [ ] All modifiers are applied
- [ ] Normals are correct
- [ ] UVs are unwrapped properly
- [ ] Materials are PBR-compliant
- [ ] Anchors are named correctly
- [ ] Textures are saved
- [ ] File size < 10MB
- [ ] Preview in Blender looks good

## Testing in JewelFit

After export:
1. Upload to admin dashboard
2. Preview in 3D Mode
3. Check material presets
4. Verify anchor attachment
5. Test on different devices

## Resources

- [glTF 2.0 Specification](https://www.khronos.org/gltf/)
- [Blender glTF Exporter Docs](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
- [PBR Guide](https://marmoset.co/posts/basic-theory-of-physically-based-rendering/)

## Support

Need help? Contact the development team or refer to:
- [Admin Guide](./ADMIN_GUIDE.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
