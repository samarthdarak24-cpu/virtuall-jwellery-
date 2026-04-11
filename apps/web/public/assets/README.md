# JewelFit 3D Assets

This directory contains placeholder assets for the JewelFit 3D application.

## Directory Structure

```
public/assets/
├── models/          # 3D glTF models
│   ├── necklace.glb
│   ├── earring.glb
│   └── ring.glb
├── images/          # 2D PNG assets for Photo Mode
│   ├── necklace_2d.png
│   ├── earring_2d.png
│   └── ring_2d.png
├── textures/        # PBR texture maps
│   ├── necklace_basecolor.png
│   ├── necklace_normal.png
│   ├── necklace_metalrough.png
│   ├── earring_basecolor.png
│   └── ring_basecolor.png
└── hdri/           # HDRI environment maps
    ├── studio.hdr
    ├── daylight.hdr
    └── indoor.hdr
```

## Asset Requirements

### 3D Models (.glb)
- Format: glTF 2.0 Binary
- Polygon count: < 50,000 triangles
- Scale: Real-world units (meters)
- Anchors: Named empty objects

### 2D Images (.png)
- Format: PNG with alpha channel
- Size: 512x512 or 1024x1024
- Background: Transparent

### Textures (.png)
- Base Color: 2048x2048, sRGB
- Normal Map: 2048x2048, Linear
- Metallic/Roughness: 2048x2048, Linear (R=metallic, G=roughness)

### HDRI (.hdr)
- Format: Radiance HDR
- Size: 2048x1024 or 4096x2048
- Equirectangular projection

## Placeholder Assets

The current assets are placeholders. Replace with actual jewelry models and textures.

### Creating Placeholder 3D Models

You can create simple placeholder models using Blender or online tools:

1. **Simple Torus** (for necklace/ring):
   ```python
   # Blender Python
   import bpy
   bpy.ops.mesh.primitive_torus_add(
       major_radius=0.02,
       minor_radius=0.005
   )
   ```

2. **Export as glTF**:
   - File → Export → glTF 2.0
   - Format: glTF Binary (.glb)

### Generating Placeholder Textures

Use online tools or Photoshop to create:
- Solid color for base color
- Flat normal map (RGB: 128, 128, 255)
- Gradient for metallic/roughness

## Production Assets

For production, you should:
1. Commission professional 3D models
2. Capture or purchase HDRI environments
3. Create high-quality PBR textures
4. Optimize all assets for web delivery

## Asset Optimization

Before uploading to production:

```bash
# Compress glTF with Draco
gltf-pipeline -i model.glb -o model-compressed.glb -d

# Optimize textures
convert texture.png -resize 2048x2048 -quality 85 texture-optimized.png

# Convert to WebP
cwebp -q 80 texture.png -o texture.webp
```

## CDN Deployment

Upload assets to S3/CDN:

```bash
# AWS S3
aws s3 sync ./public/assets s3://jewelfit-assets/assets \
  --cache-control "public, max-age=31536000, immutable"

# Set CORS
aws s3api put-bucket-cors \
  --bucket jewelfit-assets \
  --cors-configuration file://cors.json
```

## License

Ensure all assets have proper licensing for commercial use.
