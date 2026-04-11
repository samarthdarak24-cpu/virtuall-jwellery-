import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoTryOnCanvas from '@/components/photo/PhotoTryOnCanvas';
import MediaPipeDetector from '@/components/photo/MediaPipeDetector';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function PhotoMode() {
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [landmarks, setLandmarks] = useState<any>(null);
    const [selectedProductImg, setSelectedProductImg] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [useCamera, setUseCamera] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        axios.get('/api/products').then(res => {
            if (Array.isArray(res.data)) setProducts(res.data);
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!router.isReady) return;
        const { img, cat } = router.query;
        if (img && typeof img === 'string') {
            setSelectedProductImg(decodeURIComponent(img));
        }
        if (cat && typeof cat === 'string') {
            setSelectedCategory(cat);
        }
    }, [router.isReady, router.query]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setUseCamera(false);
        }
    };

    const handleCameraToggle = () => {
        setUseCamera(!useCamera);
        setImageUrl(null);
    };

    const handleProductSelect = (p: any) => {
        setSelectedProductImg(p.image);
        setSelectedCategory(p.category);
    };

    return (
        <div className="min-h-screen bg-black pb-20">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
                        <span className="text-white">Photo</span>{' '}
                        <span className="text-gradient">Mode</span>
                    </h1>
                    <p className="text-neutral-400 font-elegant text-lg">
                        See how jewelry looks on you instantly
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,380px] gap-6">
                    {/* Main Canvas */}
                    <div className="lg:col-span-1">
                        <div className="card-product min-h-[600px] flex items-center justify-center relative bg-gradient-to-br from-neutral-950 to-black rounded-3xl overflow-hidden shadow-luxury border border-luxury-gold/10">
                            {imageUrl || useCamera ? (
                                <>
                                    <MediaPipeDetector
                                        imageUrl={imageUrl}
                                        useCamera={useCamera}
                                        onLandmarksDetected={setLandmarks}
                                    />
                                    <PhotoTryOnCanvas
                                        imageUrl={imageUrl}
                                        landmarks={landmarks}
                                        productAssetUrl={selectedProductImg}
                                        category={selectedCategory}
                                    />
                                    {selectedProductImg && (
                                        <div className="absolute top-6 right-6 glass-luxury px-5 py-3 rounded-full text-sm font-semibold border border-luxury-gold/30 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
                                            Applying: {selectedCategory?.toUpperCase() || 'JEWELRY'}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-12">
                                    <motion.div
                                        className="text-8xl mb-8"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <svg className="w-24 h-24 mx-auto text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </motion.div>
                                    <h3 className="text-3xl font-display font-bold mb-6 text-white">
                                        Start Your Try-On
                                    </h3>
                                    <p className="text-neutral-400 mb-8 font-elegant text-lg max-w-md mx-auto">
                                        Upload a photo or use your camera to see how jewelry looks on you
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="btn-primary flex items-center justify-center gap-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Upload Photo
                                        </button>
                                        <button
                                            onClick={handleCameraToggle}
                                            className="btn-secondary flex items-center justify-center gap-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Use Camera
                                        </button>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        {(imageUrl || useCamera) && (
                            <motion.div
                                className="mt-6 flex flex-wrap gap-4 justify-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <button
                                    onClick={() => { setImageUrl(null); setUseCamera(false); }}
                                    className="btn-secondary text-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset
                                </button>
                                <button
                                    onClick={handleCameraToggle}
                                    className="btn-outline text-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {useCamera ? 'Stop Camera' : 'Start Camera'}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar - Product Selection */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-gradient-to-br from-neutral-900 to-black border border-luxury-gold/10 rounded-3xl h-[600px] flex flex-col shadow-2xl z-10 relative">
                            <div className="px-6 pt-6">
                                <h3 className="text-2xl font-display font-bold mb-4 text-white">
                                    Select Jewelry
                                </h3>
                                {/* Categories */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['All', 'Necklace', 'Earring', 'Ring', 'Bracelet'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat === 'All' ? null : cat.toLowerCase())}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${(selectedCategory === cat.toLowerCase()) || (cat === 'All' && !selectedCategory)
                                                ? 'bg-luxury-gold text-black border-luxury-gold'
                                                : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-luxury-gold/50 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {products
                                        .filter(p => !selectedCategory || (p.category && p.category.toLowerCase().includes(selectedCategory)))
                                        .map((p, index) => (
                                            <motion.button
                                                layout
                                                key={p.id}
                                                onClick={() => handleProductSelect(p)}
                                                className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedProductImg === p.image
                                                    ? 'border-luxury-gold bg-luxury-gold/10 shadow-gold'
                                                    : 'border-neutral-800 hover:border-luxury-gold/50 bg-neutral-900/50 hover:bg-neutral-900'
                                                    }`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="w-16 h-16 bg-black/50 rounded-xl flex items-center justify-center overflow-hidden border border-luxury-gold/20">
                                                    <img
                                                        src={p.image}
                                                        className="w-full h-full object-cover"
                                                        alt={p.name}
                                                    />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-white mb-1">{p.name}</div>
                                                    <div className="text-sm text-luxury-gold font-bold">${p.price}</div>
                                                </div>
                                                {selectedProductImg === p.image && (
                                                    <svg className="w-6 h-6 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </motion.button>
                                        ))}
                                </AnimatePresence>
                                {products.length === 0 && (
                                    <div className="text-neutral-500 text-center mt-10 font-elegant">
                                        Loading products...
                                    </div>
                                )}
                                {products.length > 0 && products.filter(p => !selectedCategory || (p.category && p.category.toLowerCase().includes(selectedCategory))).length === 0 && (
                                    <div className="text-neutral-500 text-center mt-10 font-elegant">
                                        Top matching products found.
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-luxury-gold/20">
                                <div className="text-xs text-luxury-champagne/80 bg-luxury-gold/10 p-4 rounded-xl border border-luxury-gold/20">
                                    <strong className="text-luxury-gold">Tip:</strong> Upload custom items via the Admin Panel to see them here!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
