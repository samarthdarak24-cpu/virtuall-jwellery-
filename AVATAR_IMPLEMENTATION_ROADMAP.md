# 🗺️ 3D Avatar Implementation Roadmap

## 📋 Executive Summary

This document outlines the step-by-step implementation plan for adding a **Snapchat-like 3D avatar virtual try-on** feature to the Virtual Jewelry Try-On Platform.

**Estimated Time**: 2-4 weeks  
**Complexity**: Medium-High  
**Dependencies**: @pixiv/three-vrm, existing Three.js setup

---

## 🎯 Phase 1: Foundation Setup (Week 1)

### Step 1.1: Install Required Packages ✅

```bash
cd apps/web
npm install @pixiv/three-vrm@latest
```

**Packages to install**:
- `@pixiv/three-vrm` - VRM avatar loader for Three.js
- Already have: `@react-three/fiber`, `@react-three/drei`, `three`

---

### Step 1.2: Create Utility Functions

**File**: `apps/web/src/utils/vrmLoader.ts`

```typescript
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

/**
 * Load VRM avatar from URL
 */
export const loadVRMAvatar = async (url: string) => {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm;
  
  if (vrm) {
    // Disable frustum culling
    vrm.scene.traverse((obj: any) => {
      obj.frustumCulled = false;
    });
    
    // Rotate avatar to face camera
    vrm.scene.rotation.y = Math.PI;
  }
  
  return vrm;
};

/**
 * Get bone position for jewelry attachment
 */
export const getBonePosition = (vrm: any, boneName: string) => {
  const bone = vrm.humanoid?.getBoneNode(boneName);
  if (bone) {
    const worldPosition = new THREE.Vector3();
    bone.getWorldPosition(worldPosition);
    return worldPosition;
  }
  return null;
};

/**
 * Dispose VRM avatar properly
 */
export const disposeVRM = (vrm: any) => {
  if (vrm) {
    VRMUtils.deepDispose(vrm.scene);
  }
};
```

---

### Step 1.3: Define Jewelry Attachment Points

**File**: `apps/web/src/utils/jewelryAttachment.ts`

```typescript
import * as THREE from 'three';

// VRM Humanoid Bone Names
export const ATTACHMENT_POINTS = {
  earrings: {
    left: 'leftEar',
    right: 'rightEar',
    offset: new THREE.Vector3(0, 0, 0)
  },
  necklace: {
    bone: 'neck',
    offset: new THREE.Vector3(0, -0.1, 0)
  },
  ring: {
    left: 'leftRingProximal',
    right: 'rightRingProximal',
    offset: new THREE.Vector3(0, 0, 0)
  },
  bracelet: {
    left: 'leftHand',
    right: 'rightHand',
    offset: new THREE.Vector3(0, -0.05, 0)
  },
  nosering: {
    bone: 'head', // Will need custom offset
    offset: new THREE.Vector3(0.02, -0.02, 0.08)
  }
};

export type JewelryType = keyof typeof ATTACHMENT_POINTS;

/**
 * Attach jewelry model to avatar bone
 */
export const attachJewelryToAvatar = (
  vrm: any,
  jewelryModel: THREE.Object3D,
  type: JewelryType,
  side: 'left' | 'right' | 'both' = 'both'
) => {
  const attachmentConfig = ATTACHMENT_POINTS[type];
  
  if ('bone' in attachmentConfig) {
    // Single attachment point (necklace, nose ring)
    const bone = vrm.humanoid?.getBoneNode(attachmentConfig.bone);
    if (bone) {
      const clone = jewelryModel.clone();
      clone.position.copy(attachmentConfig.offset);
      bone.add(clone);
      return [clone];
    }
  } else {
    // Dual attachment points (earrings, rings, bracelets)
    const attachedModels = [];
    
    if (side === 'left' || side === 'both') {
      const leftBone = vrm.humanoid?.getBoneNode(attachmentConfig.left);
      if (leftBone) {
        const leftModel = jewelryModel.clone();
        leftModel.position.copy(attachmentConfig.offset);
        leftBone.add(leftModel);
        attachedModels.push(leftModel);
      }
    }
    
    if (side === 'right' || side === 'both') {
      const rightBone = vrm.humanoid?.getBoneNode(attachmentConfig.right);
      if (rightBone) {
        const rightModel = jewelryModel.clone();
        rightModel.position.copy(attachmentConfig.offset);
        // Mirror for right side
        rightModel.scale.x *= -1;
        rightBone.add(rightModel);
        attachedModels.push(rightModel);
      }
    }
    
    return attachedModels;
  }
  
  return [];
};

/**
 * Remove all jewelry from avatar
 */
export const detachAllJewelry = (vrm: any) => {
  // Find all jewelry objects and remove them
  vrm.scene.traverse((obj: THREE.Object3D) => {
    if (obj.userData.isJewelry) {
      obj.parent?.remove(obj);
    }
  });
};
```

---

## 🎨 Phase 2: UI Components (Week 2)

### Step 2.1: Create Avatar Viewer Component

**File**: `apps/web/src/components/avatar/AvatarViewer.tsx`

```typescript
import { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';

interface VRMAvatarProps {
  avatarUrl: string;
  onLoad?: (vrm: any) => void;
}

function VRMAvatar({ avatarUrl, onLoad }: VRMAvatarProps) {
  const [vrm, setVrm] = useState<any>(null);
  
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(avatarUrl, (gltf) => {
      const loadedVrm = gltf.userData.vrm;
      if (loadedVrm) {
        // Setup avatar
        loadedVrm.scene.rotation.y = Math.PI;
        setVrm(loadedVrm);
        onLoad?.(loadedVrm);
      }
    });
  }, [avatarUrl]);
  
  if (!vrm) return null;
  
  return <primitive object={vrm.scene} />;
}

interface AvatarViewerProps {
  avatarUrl: string;
  onAvatarLoad?: (vrm: any) => void;
}

export default function AvatarViewer({ avatarUrl, onAvatarLoad }: AvatarViewerProps) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden shadow-2xl">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1.5, 2]} fov={30} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 1]} intensity={0.5} />
        
        {/* Avatar */}
        <VRMAvatar avatarUrl={avatarUrl} onLoad={onAvatarLoad} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        
        {/* Controls */}
        <OrbitControls
          target={[0, 1.2, 0]}
          minDistance={1}
          maxDistance={5}
          maxPolarAngle={Math.PI / 1.8}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
```

---

### Step 2.2: Create Avatar Upload Component

**File**: `apps/web/src/components/avatar/AvatarUploader.tsx`

```typescript
import { useState } from 'react';
import axios from 'axios';

export default function AvatarUploader({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.vrm') && !file.name.endsWith('.glb')) {
      setError('Please upload a VRM or GLB file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post('/api/user/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percent);
        }
      });
      
      onUploadComplete?.(response.data.avatarUrl);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4">Upload Your 3D Avatar</h3>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".vrm,.glb"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              {uploading ? (
                <div className="w-full">
                  <p className="text-purple-600 font-semibold mb-2">Uploading... {progress}%</p>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-700">Click to upload avatar</p>
                  <p className="text-sm text-gray-500 mt-2">VRM or GLB format (max 10MB)</p>
                </>
              )}
            </div>
          </label>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">Don't have an avatar?</p>
          <p className="text-xs text-blue-600 mb-3">Create one using these free tools:</p>
          <div className="space-y-2">
            <a 
              href="https://vroid.com/studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              → VRoid Studio (Desktop App)
            </a>
            <a 
              href="https://readyplayer.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              → Ready Player Me (Web-based)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 2.3: Create Avatar Try-On Page

**File**: `apps/web/src/pages/try/avatar.tsx`

```typescript
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import AvatarViewer from '@/components/avatar/AvatarViewer';
import AvatarUploader from '@/components/avatar/AvatarUploader';
import { attachJewelryToAvatar, detachAllJewelry } from '@/utils/jewelryAttachment';

export default function AvatarTryOn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [vrm, setVrm] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Load user's avatar
  useEffect(() => {
    if (status === 'authenticated') {
      axios.get('/api/user/profile').then(res => {
        if (res.data.avatarUrl) {
          setAvatarUrl(res.data.avatarUrl);
        }
        setLoading(false);
      });
    }
  }, [status]);
  
  // Load products
  useEffect(() => {
    axios.get('/api/products').then(res => {
      setProducts(res.data);
    });
  }, []);
  
  const handleAvatarLoad = (loadedVrm: any) => {
    setVrm(loadedVrm);
  };
  
  const handleProductToggle = async (productId: string) => {
    if (!vrm) return;
    
    const newSelected = new Set(selectedProducts);
    
    if (newSelected.has(productId)) {
      // Remove jewelry
      newSelected.delete(productId);
      detachAllJewelry(vrm);
      
      // Re-attach remaining jewelry
      for (const id of newSelected) {
        // Attach jewelry logic here
      }
    } else {
      // Add jewelry
      newSelected.add(productId);
      const product = products.find(p => p.id === productId);
      
      if (product) {
        // Load jewelry model and attach
        // Implementation here
      }
    }
    
    setSelectedProducts(newSelected);
  };
  
  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <Head>
        <title>3D Avatar Try-On | Virtual Jewelry</title>
      </Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
          🎭 Try On with Your 3D Avatar
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Viewer */}
          <div className="lg:col-span-2">
            {avatarUrl ? (
              <>
                <AvatarViewer avatarUrl={avatarUrl} onAvatarLoad={handleAvatarLoad} />
                <div className="mt-4 flex justify-center gap-4">
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    📸 Take Screenshot
                  </button>
                  <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    🔄 Change Avatar
                  </button>
                </div>
              </>
            ) : (
              <AvatarUploader onUploadComplete={(url) => setAvatarUrl(url)} />
            )}
          </div>
          
          {/* Product List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-8">
            <h2 className="text-2xl font-bold mb-4">Select Jewelry</h2>
            
            <div className="space-y-3">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProducts.has(product.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleProductToggle(product.id)}
                >
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-gray-500">${(product.priceCents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 Phase 3: Backend Integration (Week 3)

### Step 3.1: Create Avatar Upload API

**File**: `apps/web/src/pages/api/user/avatar/upload.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadDir: path.join(process.cwd(), 'public', 'uploads', 'avatars'),
    keepExtensions: true,
  });
  
  try {
    const [fields, files] = await form.parse(req);
    const avatarFile = files.avatar?.[0];
    
    if (!avatarFile) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }
    
    // Validate file extension
    const ext = path.extname(avatarFile.originalFilename || '').toLowerCase();
    if (!['.vrm', '.glb'].includes(ext)) {
      return res.status(400).json({ error: 'Invalid file type. Only VRM and GLB files are allowed.' });
    }
    
    // Generate public URL
    const avatarUrl = `/uploads/avatars/${path.basename(avatarFile.filepath)}`;
    
    // TODO: Save to database
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { avatarUrl }
    // });
    
    res.status(200).json({ avatarUrl, success: true });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
```

---

### Step 3.2: Update User Profile API

**File**: `apps/api/src/routes/user.ts`

```typescript
// Add to existing user routes

router.get('/profile', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true, // Add this field
      createdAt: true
    }
  });
  
  res.json(user);
});

router.put('/profile/avatar', authenticateToken, async (req, res) => {
  const { avatarUrl } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { avatarUrl }
  });
  
  res.json({ success: true, avatarUrl: user.avatarUrl });
});
```

---

### Step 3.3: Update Database Schema

**File**: `apps/api/prisma/schema.prisma`

```prisma
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  password  String?
  name      String?
  avatarUrl String?     // Add this line
  avatarType String?    // 'vrm' or 'glb'
  createdAt DateTime    @default(now())
  images    UserImage[]
  orders    Order[]
  tryOns    TryOnEvent[]
}
```

Run migration:
```bash
cd apps/api
npx prisma migrate dev --name add_avatar_fields
```

---

## 🎨 Phase 4: Polish & Testing (Week 4)

### Step 4.1: Add Screenshot Feature

```typescript
const takeScreenshot = () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-tryon-${Date.now()}.png`;
      a.click();
    });
  }
};
```

---

### Step 4.2: Add Pose System (Optional)

```typescript
const POSES = {
  default: { rotation: { x: 0, y: 0, z: 0 } },
  showEarrings: { rotation: { x: 0, y: Math.PI / 4, z: 0 } },
  showRing: { 
    rotation: { x: -Math.PI / 6, y: 0, z: 0 },
    handRaised: true 
  }
};
```

---

## ✅ Testing Checklist

- [ ] VRM avatar loads correctly
- [ ] Avatar rotates and zooms smoothly
- [ ] Jewelry attaches to correct bones
- [ ] Multiple jewelry pieces work simultaneously
- [ ] Upload validation works
- [ ] File size limits enforced
- [ ] Screenshot function works
- [ ] Mobile responsive
- [ ] Performance optimized (60 FPS)
- [ ] Error handling for invalid files

---

## 🚀 Launch Checklist

- [ ] Create sample VRM avatars for testing
- [ ] Add tutorial/guide for users
- [ ] Optimize 3D models for performance
- [ ] Test on multiple devices
- [ ] Setup error monitoring
- [ ] Create documentation
- [ ] Add analytics tracking
- [ ] Prepare marketing materials

---

## 📚 Resources

### Free VRM Avatars for Testing
- [VRoid Hub](https://hub.vroid.com/) - Thousands of free avatars
- [Ready Player Me](https://readyplayer.me/) - Quick avatar creation

### Tools
- [VRoid Studio](https://vroid.com/studio) - Desktop avatar creator
- [Blender VRM Plugin](https://github.com/saturday06/VRM-Addon-for-Blender) - For custom models

---

**Status**: Ready to Start Implementation! 🎉  
**Next Action**: Install @pixiv/three-vrm package and create basic avatar viewer

Would you like me to proceed with the implementation?
