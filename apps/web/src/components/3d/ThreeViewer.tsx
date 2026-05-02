import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text, ContactShadows, Float, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeViewerProps {
    gender: 'male' | 'female';
    product: {
        category: string;
        image: string;
        name?: string;
    } | null;
    material: {
        baseColor: string;
        metalness: number;
        roughness: number;
    };
    skinTone?: string;
    userFace?: string | null;
    advancedFeatures?: {
        pose?: 'idle' | 'pose1' | 'pose2';
        bodyType?: number;
    };
}

// Projection component for the user face to wrap around the head
function FaceDecal({ url }: { url: string }) {
    try {
        const texture = useTexture(url);
        return (
            <Decal
                position={[0, 0, 0.28]} 
                rotation={[0, 0, 0]} 
                scale={[0.48, 0.58, 1]}
            >
                <meshBasicMaterial 
                    map={texture} 
                    transparent 
                    polygonOffset 
                    polygonOffsetFactor={-10} 
                />
            </Decal>
        );
    } catch (error) {
        console.error('Failed to load face texture:', error);
        return null;
    }
}

// Wrapper for Image to handle safe loading and positioning
function AccessoryImage({ url, scale, position, rotation, opacity = 1 }: { url: string, scale: number | [number, number], position?: [number, number, number], rotation?: [number, number, number], opacity?: number }) {
    return (
        <Suspense fallback={null}>
            <Image
                url={url}
                scale={scale}
                position={position}
                rotation={rotation}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
            />
        </Suspense>
    );
}

// Advanced Pedestal/Stand
function Pedestal() {
    return (
        <group position={[0, -2.5, 0]}>
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <cylinderGeometry args={[1.5, 1.6, 0.2, 64]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 1.2, 32]} />
                <meshStandardMaterial color="#111" roughness={0.2} metalness={1} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
                <cylinderGeometry args={[1.0, 0.8, 0.05, 32]} />
                <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    );
}

function Mannequin({ gender, product, material: userMaterial, skinTone, userFace }: ThreeViewerProps) {
    const isMale = gender === 'male';
    const group = useRef<THREE.Group>(null);

    const bodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: userMaterial.baseColor || (isMale ? '#d4a373' : '#faedcd'),
        roughness: userMaterial.roughness,
        metalness: userMaterial.metalness,
        reflectivity: 1,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        side: THREE.FrontSide, // Only render outside
    }), [userMaterial.baseColor, userMaterial.roughness, userMaterial.metalness, isMale]);

    const skinMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: skinTone || (isMale ? '#e0ac69' : '#fcd5b5'),
        roughness: 0.6,
        metalness: 0.02,
        reflectivity: 0.3,
        side: THREE.FrontSide, // Only render outside
    }), [isMale, skinTone]);

    const detailMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#111',
        roughness: 0.1,
        metalness: 1,
        side: THREE.FrontSide, // Only render outside
    }), []);

    const headScale = isMale ? 1 : 0.9;
    const shoulderWidth = isMale ? 1.2 : 0.88;

    useFrame((state) => {
        if (group.current) {
            const t = state.clock.getElapsedTime();
            group.current.position.y = -0.5 + Math.sin(t * 0.5) * 0.01;
            group.current.rotation.y = Math.sin(t * 0.2) * 0.05;
        }
    });

    return (
        <group ref={group} position={[0, -0.5, 0]}>
            {/* TORSO */}
            <group position={[0, 1.8, 0]}>
                {/* Chest Sculpt */}
                <mesh position={[0, 0.5, 0]} material={bodyMaterial} castShadow>
                    <sphereGeometry args={[shoulderWidth * 0.55, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                </mesh>
                <mesh position={[0, 0, 0]} material={bodyMaterial} castShadow>
                    <cylinderGeometry args={[shoulderWidth * 0.5, shoulderWidth * 0.4, 0.9, 64]} />
                </mesh>
                <mesh position={[0, -0.6, 0]} material={bodyMaterial} castShadow>
                    <cylinderGeometry args={[shoulderWidth * 0.4, shoulderWidth * 0.5, 0.6, 64]} />
                </mesh>

                {/* NECK */}
                <group position={[0, 0.95, 0]}>
                    <mesh material={skinMaterial}>
                        <cylinderGeometry args={[0.13, 0.18, 0.45, 64]} />
                    </mesh>

                    {/* HEAD */}
                    <group position={[0, 0.55, 0]} scale={headScale}>
                        <mesh material={skinMaterial} castShadow>
                            <sphereGeometry args={[0.32, 64, 32]} />
                            
                            {/* ADVANCED 3D FACE PROJECTION */}
                            {userFace && (
                                <Suspense fallback={null}>
                                    <FaceDecal url={userFace} />
                                </Suspense>
                            )}
                        </mesh>
                        
                        <mesh position={[0, -0.1, 0.15]} material={skinMaterial} scale={[0.85, 1, 1]}>
                            <sphereGeometry args={[0.2, 32, 32]} />
                        </mesh>

                        {!userFace && (
                            <>
                                {/* Eyes Placeholder - Added Detail */}
                                <mesh position={[0.12, 0.05, 0.28]} material={detailMaterial}>
                                    <sphereGeometry args={[0.02, 16, 16]} />
                                </mesh>
                                <mesh position={[-0.12, 0.05, 0.28]} material={detailMaterial}>
                                    <sphereGeometry args={[0.02, 16, 16]} />
                                </mesh>
                            </>
                        )}

                        {/* >> ACCESSORIES << */}
                        {product?.category.toLowerCase().includes('nose') && (
                            <group position={[0.08, -0.05, 0.35]} rotation={[0, 0.4, 0]}>
                                <AccessoryImage url={product.image} scale={0.08} />
                            </group>
                        )}
                        {product?.category.toLowerCase().includes('earring') && (
                            <>
                                {/* Right Earring */}
                                <group position={[0.38, -0.05, 0.08]} rotation={[0, Math.PI / 3, 0]}>
                                    <AccessoryImage url={product.image} scale={0.6} />
                                </group>
                                {/* Left Earring */}
                                <group position={[-0.38, -0.05, 0.08]} rotation={[0, -Math.PI / 3, 0]}>
                                    <AccessoryImage url={product.image} scale={0.6} />
                                </group>
                            </>
                        )}
                    </group>

                    {product?.category.toLowerCase().includes('necklace') && (
                        <group position={[0, -0.35, 0.55]} rotation={[0.05, 0, 0]}>
                            <AccessoryImage url={product.image} scale={[1.15, 1.15]} opacity={1} />
                        </group>
                    )}
                </group>

                {/* ARMS */}
                {/* Right Arm */}
                <group position={[-(shoulderWidth / 2 + 0.15), 0.7, 0]}>
                    <mesh material={bodyMaterial}><sphereGeometry args={[0.18, 32, 32]} /></mesh>
                    <mesh position={[0, -0.5, 0]} material={bodyMaterial}><cylinderGeometry args={[0.13, 0.11, 1.1, 32]} /></mesh>
                    <group position={[0, -1.1, 0]}>
                        <mesh material={detailMaterial}><sphereGeometry args={[0.1]} /></mesh>
                        <group rotation={[0, 0.2, 0.4]}>
                            <mesh position={[0, -0.5, 0]} material={bodyMaterial}><cylinderGeometry args={[0.11, 0.09, 1.1, 32]} /></mesh>
                            <group position={[0, -1.1, 0]}>
                                <mesh material={skinMaterial} scale={[0.8, 1, 0.6]}>
                                    <sphereGeometry args={[0.16, 32, 32]} />
                                </mesh>
                                {product?.category.toLowerCase().includes('bracelet') && (
                                    <group position={[0, 0.1, 0]}>
                                        <AccessoryImage url={product.image} scale={[0.5, 0.35]} position={[0, 0, 0.15]} />
                                        <AccessoryImage url={product.image} scale={[0.5, 0.35]} position={[0, 0, -0.15]} rotation={[0, Math.PI, 0]} />
                                    </group>
                                )}
                                {product?.category.toLowerCase().includes('ring') && (
                                    <group position={[0, -0.25, 0.1]}><AccessoryImage url={product.image} scale={0.2} /></group>
                                )}
                            </group>
                        </group>
                    </group>
                </group>

                {/* Left Arm */}
                <group position={[(shoulderWidth / 2 + 0.15), 0.7, 0]}>
                    <mesh material={bodyMaterial}><sphereGeometry args={[0.18, 32, 32]} /></mesh>
                    <mesh position={[0, -0.6, 0]} material={bodyMaterial}><cylinderGeometry args={[0.13, 0.11, 1.2, 32]} /></mesh>
                    <group position={[0, -1.2, 0]}>
                        <mesh material={detailMaterial}><sphereGeometry args={[0.1]} /></mesh>
                        <mesh position={[0, -0.6, 0]} material={bodyMaterial}><cylinderGeometry args={[0.11, 0.09, 1.2, 32]} /></mesh>
                    </group>
                </group>
            </group>
            
            <Pedestal />
        </group>
    );
}

export default function ThreeViewer(props: ThreeViewerProps) {
    return (
        <group>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Mannequin {...props} />
            </Float>

            <Text
                position={[0, -3.2, 0]}
                color="white"
                fontSize={0.2}
                maxWidth={3}
                textAlign="center"
            >
                {props.product ? props.product.name : 'Virtual 3D Studio'}
            </Text>
        </group>
    );
}
