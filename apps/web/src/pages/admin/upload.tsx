import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { motion } from 'framer-motion';

// Dynamic import for background removal to avoid SSR issues
let removeBackground: any = null;
if (typeof window !== 'undefined') {
    import('@imgly/background-removal').then(module => {
        removeBackground = module.removeBackground;
    });
}

export default function AdminUpload() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('necklace');

    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Editor State
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Generate particles only on client side to avoid hydration mismatch
    const [particles, setParticles] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([]);
    
    useEffect(() => {
        // Generate particles on client side only
        const newParticles = [...Array(20)].map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 3,
        }));
        setParticles(newParticles);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setOriginalUrl(url);
            setProcessedUrl(url); // Start with original
            setMessage('');

            // Allow immediate processing options
        }
    };

    const handleRemoveBackground = async () => {
        if (!originalUrl) return;
        
        // Check if removeBackground is loaded
        if (!removeBackground) {
            setMessage('⏳ Loading AI background removal module...');
            try {
                const module = await import('@imgly/background-removal');
                removeBackground = module.removeBackground;
            } catch (error) {
                setMessage('❌ Failed to load background removal module.');
                return;
            }
        }
        
        setIsProcessing(true);
        setMessage('🚀 Removing background with advanced AI... (Fast & Accurate)');

        try {
            // Convert to blob
            const blob = await fetch(originalUrl).then(r => r.blob());
            
            // Use the imgly library with optimized settings for speed
            const pngBlob = await removeBackground(blob, {
                progress: (key: string, current: number, total: number) => {
                    const percent = Math.round((current / total) * 100);
                    setMessage(`🚀 Processing: ${percent}% - ${key}`);
                },
                output: {
                    format: 'image/png',
                    quality: 0.9,
                },
            });
            
            const pngUrl = URL.createObjectURL(pngBlob);
            setProcessedUrl(pngUrl);
            setMessage('✅ Background removed successfully with AI!');
        } catch (error) {
            console.error(error);
            setMessage('❌ Failed to remove background. Try another image or manual editing.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Apply retouch filters via Canvas
    useEffect(() => {
        if (!processedUrl || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = processedUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Clear and filter
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }, [processedUrl, brightness, contrast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!canvasRef.current || !name || !price) {
            setMessage('Please fill all fields and upload an image.');
            return;
        }

        setUploading(true);

        try {
            // 1. Convert Canvas to PNG Blob
            const blob = await new Promise<Blob | null>(resolve =>
                canvasRef.current?.toBlob(resolve, 'image/png')
            );

            if (!blob) throw new Error('Failed to generate PNG');

            // 2. Upload to Server
            const formData = new FormData();
            // Use a timestamped name for uniqueness
            const fileName = `product-${Date.now()}.png`;
            formData.append('file', blob, fileName);

            const uploadRes = await axios.post('/api/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = uploadRes.data.url;

            // 3. Create Product Entry
            await axios.post('/api/products', {
                name,
                price,
                category,
                image: imageUrl,
            });

            setMessage('✅ Product Uploaded & Optimized!');
            // Reset form
            setName('');
            setPrice('');
            setOriginalUrl(null);
            setProcessedUrl(null);
            setBrightness(100);
            setContrast(100);
        } catch (err) {
            console.error(err);
            setMessage(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-gray-900 p-8 relative overflow-hidden">
            {/* Animated Gold Particles Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1.2, 0.5],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            <Head>
                <title>Admin - Advanced Upload Pipeline</title>
            </Head>

            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-2 border-yellow-200 relative">
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold mb-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm">
                        💎 Advanced Jewelry Upload
                    </h1>
                    <p className="text-gray-600 text-sm flex items-center gap-2 font-medium">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Powered by AI for instant background removal and image optimization
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Product Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Product Name</label>
                            <input
                                type="text"
                                className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 outline-none transition-all"
                                placeholder="e.g. Platinum Solitaire Ring"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                            <input
                                type="number"
                                className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 outline-none transition-all"
                                placeholder="2499"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Category (Try-On Type)</label>
                            <select
                                className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 outline-none transition-all"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="necklace">Necklace (Neck)</option>
                                <option value="earring">Earrings (Ear)</option>
                                <option value="ring">Ring (Hand)</option>
                                <option value="bracelet">Bracelet (Wrist)</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-yellow-200">
                            <label className="block text-sm text-gray-600 mb-4 font-semibold">1. Upload Raw Image (Any Format)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-yellow-300 border-dashed rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-500 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> PNG, JPG, WEBP, SVG</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.heic,.svg" />
                            </label>
                        </div>
                    </div>

                    {/* Right: Validated Editor */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-xl p-6 border-2 border-yellow-200 flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">2. Optimize & Preview</h3>

                        <div className="flex-1 bg-white rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] border-2 border-yellow-200 relative group">
                            {processedUrl ? (
                                <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain shadow-2xl" />
                            ) : (
                                <div className="text-neutral-500 text-sm">Image preview will appear here</div>
                            )}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="relative mb-4">
                                        <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-yellow-400 font-bold text-lg mb-2">AI Processing</div>
                                    <div className="text-gray-400 text-sm animate-pulse">{message}</div>
                                </div>
                            )}
                        </div>

                        {processedUrl && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <button
                                    onClick={handleRemoveBackground}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 rounded-lg text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/30 disabled:shadow-none"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {isProcessing ? 'Processing with AI...' : '🚀 AI Background Removal'}
                                </button>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-xs text-gray-700 mb-2 block font-semibold">Brightness ({brightness}%)</label>
                                        <input
                                            type="range" min="50" max="150"
                                            value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                                            className="w-full accent-yellow-600 h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-700 mb-2 block font-semibold">Contrast ({contrast}%)</label>
                                        <input
                                            type="range" min="50" max="150"
                                            value={contrast} onChange={e => setContrast(Number(e.target.value))}
                                            className="w-full accent-yellow-600 h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-yellow-200 flex items-center justify-between">
                    <p className={`text-sm font-semibold ${message.includes('Success') || message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || !processedUrl}
                        className={`px-8 py-3 rounded-full font-bold transition-all transform shadow-lg ${uploading || !processedUrl
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {uploading ? 'Processing & Uploading...' : '💾 Save to Collection'}
                    </button>
                </div>
            </div>
        </div>
    );
}
