import { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html, useProgress, ContactShadows } from '@react-three/drei';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeViewer from '@/components/3d/ThreeViewer';
import MaterialEditor from '@/components/3d/MaterialEditor';
import { METAL_PRESETS, LIGHTING_PRESETS, MetalPreset, LightingPreset } from '@jewelfit/types';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useSession } from 'next-auth/react';
import axios from 'axios';

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                <div className="text-sm font-medium text-yellow-500">{progress.toFixed(0)}%</div>
            </div>
        </Html>
    );
}

const SKIN_TONES = [
    { name: 'Pale', color: '#fcd5b5' },
    { name: 'Medium', color: '#e0ac69' },
    { name: 'Dark', color: '#8d5524' },
    { name: 'Deep', color: '#3d2b1f' },
];

export default function ThreeDMode() {
    const { data: session } = useSession();
    const orbitControlsRef = useRef<any>(null);
    const [selectedMetal, setSelectedMetal] = useState<MetalPreset>(METAL_PRESETS[0]);
    const [selectedLighting, setSelectedLighting] = useState<LightingPreset>(LIGHTING_PRESETS[0]);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [skinTone, setSkinTone] = useState(SKIN_TONES[1].color);
    const [userFace, setUserFace] = useState<string | null>(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const [wireframe, setWireframe] = useState(false);
    const [showShadows, setShowShadows] = useState(true);
    const [activeTab, setActiveTab] = useState<'product' | 'mannequin' | 'material' | 'lighting'>('product');

    const faceUploadRef = useRef<HTMLInputElement>(null);

    // Custom material state for the mannequin/fallback
    const [customMaterial, setCustomMaterial] = useState({
        metalness: 1.0,
        roughness: 0.2,
        baseColor: '#FFD700',
    });

    useEffect(() => {
        // Only set user face if it's a valid image URL
        if (session?.user?.image && session.user.image.startsWith('http')) {
            setUserFace(session.user.image);
        }
    }, [session?.user?.image]);

    useEffect(() => {
        axios.get('/api/products').then(res => {
            setProducts(res.data || []);
            if (res.data?.length > 0) setSelectedProduct(res.data[0]);
        });
    }, []);

    const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setUserFace(url);
            setActiveTab('mannequin');
        }
    };

    const resetCamera = () => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
        }
    };

    const takeScreenshot = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.setAttribute('download', 'jewelfit-tryon.png');
            link.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-gray-900 font-sans overflow-x-hidden relative">
            {/* Animated Gold Particles Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => {
                    const randomLeft = Math.random() * 100;
                    const randomTop = Math.random() * 100;
                    const randomDuration = 4 + Math.random() * 3;
                    const randomDelay = Math.random() * 3;
                    
                    return (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"
                            style={{
                                left: `${randomLeft}%`,
                                top: `${randomTop}%`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                y: [0, -40, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.5, 1.2, 0.5],
                            }}
                            transition={{
                                duration: randomDuration,
                                repeat: Infinity,
                                delay: randomDelay,
                            }}
                        />
                    );
                })}
                {/* Gold Glow Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>

            <Navbar />

            <main className="relative pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT SIDE: 3D VIEWPORT */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group h-[700px] w-full rounded-[2.5rem] overflow-hidden border-2 border-yellow-200 shadow-2xl shadow-yellow-500/20 bg-black"
                        >
                            {/* Floating Toolbar */}
                            <div className="absolute top-6 left-6 z-20 flex gap-2">
                                <div className="bg-white/90 backdrop-blur-xl p-1 rounded-2xl border-2 border-yellow-200 flex shadow-lg">
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${gender === 'female' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        FEMALE
                                    </button>
                                    <button
                                        onClick={() => setGender('male')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${gender === 'male' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        MALE
                                    </button>
                                </div>
                                <button
                                    onClick={resetCamera}
                                    title="Reset Camera"
                                    className="p-3 bg-white/90 backdrop-blur-xl border-2 border-yellow-200 rounded-2xl hover:bg-yellow-50 transition-colors shadow-lg"
                                >
                                    🔄
                                </button>
                                <button
                                    onClick={() => setAutoRotate(!autoRotate)}
                                    title="Toggle Rotation"
                                    className={`p-3 backdrop-blur-xl border-2 rounded-2xl transition-all shadow-lg ${autoRotate ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white/90 border-yellow-200 text-gray-600'}`}
                                >
                                    🔃
                                </button>
                            </div>

                            {/* Viewport Actions */}
                            <div className="absolute top-6 right-6 z-20 flex gap-2">
                                <button
                                    onClick={takeScreenshot}
                                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-yellow-500/30 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                                >
                                    📸 Capture
                                </button>
                            </div>

                            <Canvas shadows gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ background: '#000000' }}>
                                <PerspectiveCamera makeDefault position={[0, 1.5, 6]} fov={45} />
                                <OrbitControls
                                    ref={orbitControlsRef}
                                    autoRotate={autoRotate}
                                    autoRotateSpeed={0.5}
                                    enableDamping
                                    dampingFactor={0.05}
                                    minDistance={2}
                                    maxDistance={12}
                                    target={[0, 1, 0]}
                                />

                                {/* HDRI Environment Lighting based on research paper */}
                                <Environment 
                                    preset={selectedLighting.preset as any} 
                                    blur={0.5} 
                                />
                                <ambientLight intensity={0.5} />
                                <spotLight 
                                    position={selectedLighting.position as [number, number, number]} 
                                    angle={0.15} 
                                    penumbra={1} 
                                    intensity={selectedLighting.intensity * 1.5} 
                                    castShadow 
                                />
                                <pointLight position={[2, 2, 2]} intensity={0.5} />
                                <pointLight position={[-2, 2, -2]} intensity={0.3} />

                                <Suspense fallback={<Loader />}>
                                    <ThreeViewer
                                        gender={gender}
                                        product={selectedProduct}
                                        material={customMaterial}
                                        skinTone={skinTone}
                                        userFace={userFace}
                                    />
                                </Suspense>

                                {showShadows && <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={1.5} far={4.5} />}
                            </Canvas>

                            {/* Info Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                                <div className="bg-black/80 backdrop-blur-md p-6 rounded-3xl border-2 border-yellow-500/50 max-w-xs animate-slide-up pointer-events-auto shadow-xl shadow-yellow-500/20">
                                    <div className="text-xs text-yellow-400 tracking-widest uppercase mb-1 font-bold">{selectedProduct?.category}</div>
                                    <h2 className="text-xl font-display font-bold text-white mb-3">
                                        {selectedProduct?.name || 'Loading Model...'}
                                    </h2>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Experience the finest craftsmanship in full 3D. Inspect every detail with our zoom and rotate tools.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: ADVANCED CONTROLS */}
                    <div className="w-full lg:w-[400px] space-y-6">
                        {/* Tab Switcher */}
                        <div className="grid grid-cols-4 gap-2 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border-2 border-yellow-200 shadow-lg">
                            {(['product', 'mannequin', 'material', 'lighting'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 rounded-xl text-[10px] uppercase font-black transition-all ${activeTab === tab ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30' : 'text-gray-600 hover:text-gray-900 hover:bg-yellow-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {/* TAB: PRODUCT SELECTOR */}
                            {activeTab === 'product' && (
                                <motion.div
                                    key="product"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6 bg-white/90 backdrop-blur-xl rounded-[2rem] border-2 border-yellow-200 shadow-xl"
                                >
                                    <h3 className="text-lg font-display mb-4 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent font-bold">Catalog Selection</h3>
                                    <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
                                        {products.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedProduct(p)}
                                                className={`group relative p-3 rounded-2xl border-2 transition-all text-left overflow-hidden ${selectedProduct?.id === p.id
                                                    ? 'border-yellow-400 bg-yellow-50'
                                                    : 'border-yellow-200 hover:border-yellow-300 bg-white'
                                                    }`}
                                            >
                                                <div className="aspect-square bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl overflow-hidden mb-3">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="font-semibold text-xs truncate text-gray-900">{p.name}</div>
                                                <div className="text-[10px] text-gray-600 uppercase font-bold">{p.category}</div>
                                                {selectedProduct?.id === p.id && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB: MANNEQUIN CONTROLS */}
                            {activeTab === 'mannequin' && (
                                <motion.div
                                    key="mannequin"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6 bg-white/90 backdrop-blur-xl rounded-[2rem] border-2 border-yellow-200 shadow-xl space-y-6"
                                >
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent uppercase tracking-widest">Personalize Identity</h3>
                                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-yellow-200 p-5 rounded-3xl group relative overflow-hidden transition-all hover:border-yellow-400">
                                            {userFace ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-luxury-gold shadow-lg ring-4 ring-luxury-gold/10">
                                                        <img src={userFace} className="w-full h-full object-cover" alt="User Face" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1">Face Mode: Active</div>
                                                        <button 
                                                            onClick={() => setUserFace(null)}
                                                            className="text-[10px] text-red-400 font-black hover:text-white uppercase transition-colors"
                                                        >
                                                            Remove Likeness
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <button 
                                                        onClick={() => faceUploadRef.current?.click()}
                                                        className="px-6 py-2 bg-luxury-gold text-black text-xs font-black uppercase rounded-xl hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-yellow-500/10"
                                                    >
                                                        Upload Your Face
                                                    </button>
                                                    <p className="text-[10px] text-neutral-500 mt-3 font-medium">Map your photo onto the 3D head for a realistic try-on.</p>
                                                </div>
                                            )}
                                            <input 
                                                ref={faceUploadRef}
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFaceUpload} 
                                                className="hidden" 
                                            />
                                        </div>
                                    </section>

                                    <section className="pt-4 border-t border-white/5">
                                        <h3 className="text-sm font-bold m-2 text-luxury-gold uppercase tracking-widest">Skin Preset</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {SKIN_TONES.map(tone => (
                                                <button
                                                    key={tone.name}
                                                    onClick={() => { setSkinTone(tone.color); setUserFace(null); }}
                                                    className={`aspect-square rounded-full border-4 transition-all scale-90 hover:scale-100 ${skinTone === tone.color && !userFace ? 'border-luxury-gold' : 'border-black shadow-inner'}`}
                                                    style={{ backgroundColor: tone.color }}
                                                    title={tone.name}
                                                />
                                            ))}
                                        </div>
                                    </section>

                                    <section className="pt-4 border-t border-white/5">
                                        <h3 className="text-sm font-bold mb-4 text-luxury-gold uppercase tracking-widest">Display Settings</h3>
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                                <span className="text-xs font-bold">WIREFRAME VIEW</span>
                                                <input type="checkbox" checked={wireframe} onChange={e => setWireframe(e.target.checked)} className="accent-luxury-gold" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                                                <span className="text-xs font-bold">REALISTIC SHADOWS</span>
                                                <input type="checkbox" checked={showShadows} onChange={e => setShowShadows(e.target.checked)} className="accent-luxury-gold" />
                                            </label>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {/* TAB: MATERIAL EDITOR */}
                            {activeTab === 'material' && (
                                <motion.div
                                    key="material"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-0"
                                >
                                    <MaterialEditor
                                        material={customMaterial}
                                        onMaterialChange={setCustomMaterial}
                                        metalPresets={METAL_PRESETS as any}
                                        onPresetSelect={(preset: any) => {
                                            setSelectedMetal(preset);
                                            setCustomMaterial({
                                                baseColor: preset.color,
                                                metalness: preset.metalness,
                                                roughness: preset.roughness,
                                            });
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* TAB: LIGHTING */}
                            {activeTab === 'lighting' && (
                                <motion.div
                                    key="lighting"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6 bg-neutral-900 rounded-[2rem] border border-white/5 space-y-6"
                                >
                                    <section>
                                        <h3 className="text-sm font-bold mb-4 text-luxury-gold uppercase tracking-widest">Environment Mood</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {LIGHTING_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => setSelectedLighting(preset)}
                                                    className={`p-4 rounded-2xl border transition-all text-xs font-black uppercase ${selectedLighting.name === preset.name
                                                        ? 'border-luxury-gold bg-luxury-gold text-black shadow-lg shadow-yellow-500/20'
                                                        : 'border-white/5 text-neutral-500 hover:text-white'
                                                        }`}
                                                >
                                                    {preset.name}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* GLOBAL RESET */}
                        <button
                            onClick={() => {
                                setSkinTone(SKIN_TONES[1].color);
                                setAutoRotate(true);
                                setWireframe(false);
                                resetCamera();
                            }}
                            className="w-full py-4 rounded-2xl border-2 border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors uppercase shadow-lg"
                        >
                            Reset Studio Defaults
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
