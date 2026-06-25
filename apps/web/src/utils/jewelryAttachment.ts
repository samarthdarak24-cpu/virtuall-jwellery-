import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// VRM Humanoid Bone Names mapping
export const ATTACHMENT_POINTS = {
  earring: {
    left: 'leftEar',
    right: 'rightEar',
    offset: new THREE.Vector3(0, 0, 0)
  },
  earrings: {
    left: 'leftEar',
    right: 'rightEar',
    offset: new THREE.Vector3(0, 0, 0)
  },
  necklace: {
    bone: 'neck',
    offset: new THREE.Vector3(0, -0.06, 0.05)
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
  nosepin: {
    bone: 'head',
    offset: new THREE.Vector3(0.02, -0.02, 0.08)
  },
  nosering: {
    bone: 'head',
    offset: new THREE.Vector3(0.02, -0.02, 0.08)
  }
};

export type JewelryType = keyof typeof ATTACHMENT_POINTS;

/**
 * Load jewelry model (supports GLTF, or falls back to creating textured Plane from 2D image)
 */
export const loadJewelryModel = async (product: any): Promise<THREE.Object3D> => {
  const modelUrl = product.modelUrl || product.assets?.find((a: any) => a.type === 'MODEL_GLTF')?.url;
  
  if (modelUrl) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelUrl);
    const model = gltf.scene;
    // Mark children as jewelry
    model.traverse((child) => {
      child.userData.isJewelry = true;
    });
    model.userData.isJewelry = true;
    return model;
  } else {
    // Fallback to loading 2D image as flat 3D plane
    const textureLoader = new THREE.TextureLoader();
    const texture = await textureLoader.loadAsync(product.image);
    
    let size = 0.25;
    const cat = (product.category || '').toLowerCase();
    
    if (cat.includes('earring')) {
      size = 0.06;
    } else if (cat.includes('ring')) {
      size = 0.025;
    } else if (cat.includes('nose')) {
      size = 0.02;
    } else if (cat.includes('bracelet')) {
      size = 0.12;
    } else if (cat.includes('necklace')) {
      size = 0.35;
    }

    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.8,
      alphaTest: 0.05,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isJewelry = true;
    return mesh;
  }
};

/**
 * Attach jewelry model to avatar bone
 */
export const attachJewelryToAvatar = (
  vrm: any,
  jewelryModel: THREE.Object3D,
  type: string,
  side: 'left' | 'right' | 'both' = 'both'
) => {
  const normalizedType = type.toLowerCase() as JewelryType;
  const attachmentConfig = ATTACHMENT_POINTS[normalizedType] || ATTACHMENT_POINTS['necklace'];
  
  if ('bone' in attachmentConfig) {
    // Single attachment point (necklace, nose ring)
    const bone = vrm.humanoid?.getBoneNode(attachmentConfig.bone);
    if (bone) {
      const clone = jewelryModel.clone();
      clone.position.copy(attachmentConfig.offset);
      // Mark clone and children as jewelry
      clone.traverse((child) => {
        child.userData.isJewelry = true;
      });
      clone.userData.isJewelry = true;
      bone.add(clone);
      return [clone];
    }
  } else {
    // Dual attachment points (earrings, rings, bracelets)
    const attachedModels: THREE.Object3D[] = [];
    
    if (side === 'left' || side === 'both') {
      const leftBone = vrm.humanoid?.getBoneNode(attachmentConfig.left);
      if (leftBone) {
        const leftModel = jewelryModel.clone();
        leftModel.position.copy(attachmentConfig.offset);
        leftModel.traverse((child) => {
          child.userData.isJewelry = true;
        });
        leftModel.userData.isJewelry = true;
        leftBone.add(leftModel);
        attachedModels.push(leftModel);
      }
    }
    
    if (side === 'right' || side === 'both') {
      const rightBone = vrm.humanoid?.getBoneNode(attachmentConfig.right);
      if (rightBone) {
        const rightModel = jewelryModel.clone();
        rightModel.position.copy(attachmentConfig.offset);
        rightModel.traverse((child) => {
          child.userData.isJewelry = true;
        });
        rightModel.userData.isJewelry = true;
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
  if (!vrm || !vrm.scene) return;
  
  const toRemove: THREE.Object3D[] = [];
  vrm.scene.traverse((obj: THREE.Object3D) => {
    if (obj.userData.isJewelry) {
      toRemove.push(obj);
    }
  });
  
  toRemove.forEach((obj) => {
    obj.parent?.remove(obj);
  });
};
