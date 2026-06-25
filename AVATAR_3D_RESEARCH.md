# 🎭 3D Avatar Virtual Try-On Research & Implementation Plan

## 📋 Research Summary

### Project Goal
Implement a **Snapchat-like 3D avatar system** where users can create personalized 3D avatars and virtually try on jewelry pieces in real-time.

---

## 🔍 Technology Stack Research

### Option 1: Ready Player Me (Recommended ⭐)
**Description**: Cross-platform 3D avatar creation platform with web integration

**Pros**:
- ✅ Professional, customizable avatars
- ✅ Easy web integration via iframe or SDK
- ✅ Free tier available
- ✅ Exports GLB/GLTF files compatible with Three.js
- ✅ Extensive customization options (face, hair, clothing, accessories)
- ✅ No complex 3D modeling required

**Cons**:
- ⚠️ Requires external API (internet dependency)
- ⚠️ Limited free tier (may need paid plan for production)

**Integration Approach**:
```javascript
// Load avatar from Ready Player Me
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// User creates avatar at: https://readyplayerme.com/avatar
// Gets avatar URL: https://models.readyplayerme.com/[avatar-id].glb
// Load into Three.js scene
```

---

### Option 2: VRM Format with @pixiv/three-vrm ⭐⭐
**Description**: Open standard for 3D humanoid avatars, widely used in VTuber applications

**Pros**:
- ✅ Open source and free
- ✅ Excellent Three.js integration
- ✅ Supports facial expressions and animations
- ✅ Works with MediaPipe for real-time face tracking
- ✅ VRoid Studio provides free avatar creator
- ✅ No API dependencies

**Cons**:
- ⚠️ Users need to create avatars externally (VRoid Studio desktop app)
- ⚠️ More complex setup than Ready Player Me
- ⚠️ Requires understanding of bone structures

**Integration Approach**:
```javascript
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Load VRM model with plugin
const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));
```

---

### Option 3: MediaPipe Face Mesh + Custom 3D Head Model
**Description**: Use MediaPipe for face detection and overlay jewelry on a generic 3D head model

**Pros**:
- ✅ Already using MediaPipe in the project
- ✅ Real-time face tracking
- ✅ No external dependencies
- ✅ Lightweight solution

**Cons**:
- ⚠️ Limited to face/head only (no full body avatar)
- ⚠️ Less personalized than avatar systems
- ⚠️ Requires custom 3D modeling

**Best For**: Quick implementation focused on jewelry try-on without full avatar customization

---

### Option 4: Custom Avatar Builder with Three.js
**Description**: Build a custom avatar creator from scratch

**Pros**:
- ✅ Full control over customization
- ✅ No external dependencies
- ✅ Branded experience

**Cons**:
- ❌ Very time-consuming to build
- ❌ Requires 3D modeling expertise
- ❌ Significant development cost

---

## 🎯 Recommended Implementation Plan

### **Best Approach: Hybrid Solution (VRM + MediaPipe)**

Combine VRM avatars with MediaPipe face tracking for the most powerful and flexible solution.

---

## 📦 Required Packages

```json
{
  "dependencies": {
    "@pixiv/three-vrm": "^3.0.0",
    "@react-three/fiber": "^8.15.12",
    "@react-three/drei": "^9.92.7",
    "@mediapipe/face_mesh": "^0.4.1633559619",
    "three": "^0.160.0"
  }
}
```

---

## 🏗️ Implementation Architecture

### Phase 1: Avatar Creation & Upload
1. User creates avatar using **VRoid Studio** (free desktop app)
2. User uploads VRM file to platform
3. Store avatar GLB URL in user profile

**Alternative**: Integrate Ready Player Me iframe for in-app avatar creation

### Phase 2: 3D Scene Setup
1. Load VRM avatar in Three.js scene
2. Position camera for optimal jewelry viewing
3. Add lighting for realistic rendering

### Phase 3: Jewelry Placement System
1. Define attachment points on avatar (ears, neck, hands)
2. Load jewelry 3D models (already have GLB models)
3. Attach jewelry to avatar bones/joints
4. Enable real-time movement and rotation

### Phase 4: Real-Time Face Tracking (Optional)
1. Use MediaPipe to track user's face
2. Apply facial expressions to avatar
3. Sync avatar head movements with user

---

## 🎨 Feature List

### Core Features (MVP)
1. ✅ **Avatar Upload System**
   - Accept VRM/GLB files
   - Store in user profile
   - Preview avatar in 3D viewer

2. ✅ **Jewelry Try-On on Avatar**
   - Load jewelry models from product catalog
   - Attach to avatar (earrings, necklaces, rings, bracelets)
   - Real-time preview with rotation

3. ✅ **Camera Controls**
   - Orbit controls for 360° viewing
   - Zoom in/out
   - Focus on specific jewelry pieces

4. ✅ **Multiple Jewelry Layers**
   - Try on multiple items simultaneously
   - Mix and match different pieces

### Advanced Features (Phase 2)
5. ✅ **Avatar Customization in-app**
   - Integrate Ready Player Me iframe
   - Or build simple customizer (hair color, skin tone)

6. ✅ **Pose System**
   - Predefined poses for different jewelry types
   - "Show earrings" pose (turn head)
   - "Show ring" pose (hand up)

7. ✅ **Screenshot & Share**
   - Capture avatar with jewelry
   - Share on social media
   - Save to user gallery

8. ✅ **Comparison Mode**
   - Side-by-side comparison of different jewelry
   - A/B testing for purchase decisions

---

## 📁 File Structure Plan

```
apps/web/src/
├── components/
│   └── avatar/
│       ├── AvatarViewer.tsx          # Main 3D avatar viewer
│       ├── AvatarLoader.tsx          # VRM loader component
│       ├── JewelryAttachment.tsx     # Jewelry positioning logic
│       ├── AvatarControls.tsx        # Camera controls
│       └── AvatarUploader.tsx        # Upload VRM files
├── pages/
│   ├── try/
│   │   └── avatar.tsx                # New avatar try-on page
│   └── profile/
│       └── avatar-settings.tsx       # Avatar management
└── utils/
    ├── vrmLoader.ts                  # VRM loading utilities
    └── jewelryAttachment.ts          # Attachment point logic
```

---

## 🔧 Technical Implementation Details

### 1. VRM Avatar Loading
```typescript
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const loadVRMAvatar = async (url: string) => {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm;
  
  // Disable frustum culling for better visibility
  VRMUtils.deepDispose(vrm.scene);
  
  return vrm;
};
```

### 2. Jewelry Attachment Points
```typescript
// Define attachment points based on VRM bone structure
const ATTACHMENT_POINTS = {
  earrings: {
    left: 'leftEar',
    right: 'rightEar'
  },
  necklace: 'neck',
  ring: {
    left: 'leftRingFinger',
    right: 'rightRingFinger'
  },
  bracelet: {
    left: 'leftWrist',
    right: 'rightWrist'
  }
};

export const attachJewelry = (vrm, jewelryModel, type, side = 'both') => {
  const boneName = ATTACHMENT_POINTS[type][side] || ATTACHMENT_POINTS[type];
  const bone = vrm.humanoid.getBoneNode(boneName);
  
  if (bone) {
    bone.add(jewelryModel);
  }
};
```

### 3. Avatar Scene Setup
```typescript
// In React Three Fiber component
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export const AvatarScene = ({ avatarUrl, jewelry }) => {
  return (
    <Canvas camera={{ position: [0, 1.5, 2], fov: 30 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Avatar Model */}
      <VRMAvatar url={avatarUrl} jewelry={jewelry} />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Camera controls */}
      <OrbitControls 
        target={[0, 1.5, 0]} 
        minDistance={1} 
        maxDistance={5} 
      />
    </Canvas>
  );
};
```

---

## 🎯 User Flow

### Avatar Try-On Journey
1. **Homepage** → User clicks "Try with 3D Avatar"
2. **Avatar Check** → System checks if user has avatar
   - **No Avatar**: Redirect to avatar creation/upload
   - **Has Avatar**: Load avatar viewer
3. **Avatar Viewer** → User sees their avatar in 3D
4. **Product Selection** → Browse jewelry products
5. **Try-On** → Click product to attach to avatar
6. **Customize** → Rotate, zoom, change angles
7. **Purchase/Save** → Add to cart or save to wishlist

---

## 📊 Database Schema Updates

### Add to User Model
```sql
ALTER TABLE User ADD COLUMN avatarUrl VARCHAR(255);
ALTER TABLE User ADD COLUMN avatarType VARCHAR(50); -- 'vrm', 'glb', 'readyplayerme'
```

### New AvatarPreset Table (Optional)
```sql
CREATE TABLE AvatarPreset (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES User(id),
  name VARCHAR(100),
  avatarUrl VARCHAR(255),
  thumbnail VARCHAR(255),
  isDefault BOOLEAN,
  createdAt TIMESTAMP
);
```

---

## 🚀 Implementation Timeline

### Week 1: Research & Setup
- ✅ Research complete
- [ ] Install required packages
- [ ] Setup VRM loader utilities
- [ ] Create basic avatar viewer component

### Week 2: Core Avatar System
- [ ] Avatar upload functionality
- [ ] VRM file validation
- [ ] 3D scene with lighting and camera
- [ ] Basic jewelry attachment system

### Week 3: Jewelry Integration
- [ ] Define attachment points for all jewelry types
- [ ] Implement attachment logic
- [ ] Test with existing jewelry models
- [ ] Add multiple jewelry support

### Week 4: Polish & Advanced Features
- [ ] Add avatar customization options
- [ ] Implement screenshot feature
- [ ] Optimize performance
- [ ] Mobile responsiveness

---

## 🎨 UI/UX Mockup Flow

```
┌────────────────────────────────────────────┐
│  Virtual Jewelry Try-On with Avatar       │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────┐    ┌─────────────────┐ │
│  │              │    │                 │ │
│  │   3D Avatar  │    │  Product List   │ │
│  │   Viewer     │    │  [Earrings]     │ │
│  │              │    │  [Necklace]     │ │
│  │   [Avatar]   │    │  [Ring]         │ │
│  │              │    │  [Bracelet]     │ │
│  │              │    │                 │ │
│  └──────────────┘    └─────────────────┘ │
│                                            │
│  [ Rotate ] [ Zoom ] [ Screenshot ]       │
│  [ Change Avatar ] [ Add to Cart ]        │
└────────────────────────────────────────────┘
```

---

## 🔒 Security Considerations

1. **File Upload Validation**
   - Limit file size (max 10MB for VRM files)
   - Validate file type (only .vrm, .glb allowed)
   - Scan for malicious content

2. **Storage**
   - Store avatars in S3/cloud storage
   - Generate unique IDs for each avatar
   - Implement CDN for faster loading

3. **Privacy**
   - Users control who can see their avatar
   - Option to use generic avatars
   - Clear data deletion policies

---

## 📈 Performance Optimization

1. **LOD (Level of Detail)**
   - Use lower poly models for distant views
   - Progressive loading for large files

2. **Caching**
   - Cache loaded avatars in memory
   - LocalStorage for recent avatars

3. **Lazy Loading**
   - Load jewelry models on demand
   - Preload popular items

---

## 🎓 Learning Resources

### Documentation
- [Three.js VRM Documentation](https://github.com/pixiv/three-vrm)
- [VRoid Studio Guide](https://vroid.com/studio)
- [Ready Player Me API Docs](https://docs.readyplayer.me/)
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)

### Tutorials
- VRM + React Three Fiber integration
- MediaPipe face tracking with avatars
- Three.js jewelry attachment techniques

---

## ✅ Next Steps

1. **Install Dependencies**
   ```bash
   cd apps/web
   npm install @pixiv/three-vrm
   ```

2. **Create Avatar Viewer Component**
   - Start with basic VRM loading
   - Add camera controls
   - Test with sample VRM file

3. **Implement Jewelry Attachment**
   - Define bone/attachment point mapping
   - Test with earrings first (simplest)
   - Expand to other jewelry types

4. **Build UI**
   - Avatar try-on page
   - Upload interface
   - Product selector

---

## 🎉 Expected Outcome

Users will be able to:
- ✅ Create/upload personalized 3D avatars
- ✅ Try on jewelry in realistic 3D environment
- ✅ View from all angles with smooth controls
- ✅ Mix and match multiple jewelry pieces
- ✅ Take screenshots and share results
- ✅ Experience a Snapchat-like interactive try-on

---

**Research Completed By**: Kiro AI Assistant  
**Date**: June 19, 2026  
**Status**: Ready for Implementation ✨

---

## 💡 Pro Tips

1. **Start Simple**: Begin with earrings (easiest attachment point)
2. **Use Sample Models**: Test with free VRM models from VRoid Hub
3. **Optimize Early**: 3D can be performance-heavy, optimize from day 1
4. **Mobile First**: Ensure touch controls work well on mobile devices
5. **Fallback Options**: Provide 2D photo try-on as fallback for low-end devices

---

Ready to implement! 🚀
