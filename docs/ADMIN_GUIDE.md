# Admin Guide - Adding New Jewelry Products

This guide walks you through the process of adding new jewelry products to JewelFit 3D.

## Prerequisites

- Admin account access (demo@jewelfit.test)
- 3D model in glTF format
- PBR texture maps
- 2D PNG asset for Photo Mode

## Step 1: Prepare Your Assets

### 3D Model Requirements
- **Format**: glTF 2.0 (.glb or .gltf)
- **Polygon count**: < 50,000 triangles
- **Anchors**: Named empty objects for attachment points
  - Earrings: `ear_lobe_L`, `ear_lobe_R`
  - Necklace: `neck_anchor`
  - Ring: `finger_0_L` through `finger_4_R`
- **Scale**: Real-world units (meters)

### PBR Textures
Prepare the following texture maps (recommended 2048x2048):
- **Base Color** (albedo) - RGB
- **Normal Map** - RGB (OpenGL format)
- **Metallic/Roughness** - Combined (R=metallic, G=roughness)
- **Ambient Occlusion** (optional) - Grayscale

### 2D Asset
- **Format**: PNG with alpha channel
- **Size**: 512x512 or 1024x1024
- **Background**: Transparent
- **View**: Front-facing, centered

## Step 2: Export from Blender

See [BLENDER_GUIDE.md](./BLENDER_GUIDE.md) for detailed Blender export instructions.

**Quick export settings**:
1. File → Export → glTF 2.0
2. Format: glTF Binary (.glb)
3. Include: Selected Objects
4. Transform: +Y Up
5. Geometry: Apply Modifiers, UVs, Normals
6. Materials: Export

## Step 3: Upload Assets

### Using the Admin Dashboard

1. **Login** to admin account
2. Navigate to **Admin Dashboard** (`/admin`)
3. Click **"Add New Product"**

### Fill Product Details
```
SKU: JF-NECK-004
Title: Emerald Pendant Necklace
Description: 18K gold necklace with natural emerald
Price: $1,899.90 (enter in cents: 189990)
```

### Upload Assets

**3D Model**:
1. Click "Upload 3D Model"
2. Select your `.glb` file
3. Wait for upload confirmation
4. Metadata will auto-populate

**PBR Textures**:
1. Upload Base Color texture
2. Upload Normal map
3. Upload Metallic/Roughness map
4. System will associate with the model

**2D Asset**:
1. Upload PNG with transparency
2. This will be used in Photo Mode

## Step 4: Configure Metadata

### Anchor Points
Specify which anchors your jewelry uses:
```json
{
  "anchors": ["neck_anchor"],
  "category": "necklace",
  "weight_grams": 15.5,
  "materials": ["18K Gold", "Emerald"],
  "dimensions": {
    "length_cm": 45,
    "pendant_width_cm": 2.5
  }
}
```

### Material Variants
Add material options:
- Gold (default)
- Rose Gold (+$200)
- White Gold (+$150)
- Platinum (+$500)

### Size Variants (for rings)
```json
{
  "sizes": [
    { "size": "6", "sku_suffix": "-S6" },
    { "size": "7", "sku_suffix": "-S7" },
    { "size": "8", "sku_suffix": "-S8" }
  ]
}
```

## Step 5: Preview & Test

### 3D Preview
1. Click "Preview in 3D Mode"
2. Check model loads correctly
3. Test material presets
4. Verify lighting looks good
5. Check anchor attachment

### Photo Mode Preview
1. Click "Preview in Photo Mode"
2. Upload test image
3. Verify jewelry positions correctly
4. Check blending and shadows

## Step 6: Publish

1. Review all details
2. Click **"Publish Product"**
3. Product is now live on the catalog

## Common Issues & Solutions

### Model doesn't load
- **Check file size**: Should be < 10MB
- **Verify format**: Must be glTF 2.0
- **Check console**: Look for loading errors

### Jewelry appears too large/small
- **Check scale**: Model should use real-world units
- **Adjust in Blender**: Scale before export
- **Use metadata**: Add scale multiplier

### Materials look wrong
- **Check texture format**: PNG or JPEG
- **Verify channels**: Metallic/Roughness in correct channels
- **Test presets**: Try different metal presets

### Anchors not working
- **Check naming**: Must match exactly (case-sensitive)
- **Verify hierarchy**: Anchors should be at root level
- **Test in Blender**: Ensure anchors are empty objects

## Asset Optimization Tips

### Reduce File Size
- Compress textures (use 1024x1024 instead of 4096x4096)
- Use KTX2 format for textures (Basis Universal)
- Decimate mesh if poly count is high
- Remove unused materials/textures

### Improve Performance
- Use LOD (Level of Detail) models
- Bake complex materials to textures
- Combine meshes where possible
- Use instancing for repeated elements

## Batch Upload

For uploading multiple products:

1. Prepare CSV file:
```csv
sku,title,description,price_cents,model_url,texture_base_url,texture_normal_url,image_2d_url
JF-EAR-005,Pearl Earrings,Freshwater pearl studs,59990,/models/pearl.glb,/tex/pearl_base.png,,/img/pearl_2d.png
```

2. Use admin bulk upload:
```bash
npm run admin:bulk-upload products.csv
```

## Quality Checklist

Before publishing, verify:
- [ ] Model loads in < 3 seconds
- [ ] Textures are sharp and clear
- [ ] Materials respond to lighting correctly
- [ ] Anchors attach to correct body parts
- [ ] 2D asset has clean transparency
- [ ] Product info is accurate
- [ ] Price is correct
- [ ] SKU is unique
- [ ] All variants are configured
- [ ] Preview looks good on mobile

## Support

Need help? Contact the development team or refer to:
- [Blender Export Guide](./BLENDER_GUIDE.md)
- [API Documentation](../README.md#api-documentation)
- [Testing Checklist](./TESTING_CHECKLIST.md)
