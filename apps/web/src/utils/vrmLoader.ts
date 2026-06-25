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
    // Disable frustum culling so it does not disappear when rotated out of view boundary
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
