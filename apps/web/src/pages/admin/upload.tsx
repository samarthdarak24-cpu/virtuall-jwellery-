import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { removeBackground } from '@imgly/background-removal';

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
        setIsProcessing(true);
        setMessage('Removing background with ML model... (this may take a moment)');

        try {
            // @imgly/background-removal works on Blob or URL
            const blob = await fetch(originalUrl).then(r => r.blob());
            const pngBlob = await removeBackground(blob);
            const pngUrl = URL.createObjectURL(pngBlob);
            setProcessedUrl(pngUrl);
            setMessage('Background removed successfully!');
        } catch (error) {
            console.error(error);
            setMessage('Failed to remove background. Try manually or another image.');
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
        <div className="min-h-screen bg-neutral-900 text-white p-8">
            <Head>
                <title>Admin - Advanced Upload Pipeline</title>
            </Head>

            <div className="max-w-4xl mx-auto bg-neutral-800 p-8 rounded-xl shadow-2xl border border-neutral-700">
                <h1 className="text-3xl font-display font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                    💎 Advanced Jewelry Upload
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Product Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Product Name</label>
                            <input
                                type="text"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                                placeholder="e.g. Platinum Solitaire Ring"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                            <input
                                type="number"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                                placeholder="2499"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Category (Try-On Type)</label>
                            <select
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="necklace">Necklace (Neck)</option>
                                <option value="earring">Earrings (Ear)</option>
                                <option value="ring">Ring (Hand)</option>
                                <option value="bracelet">Bracelet (Wrist)</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-neutral-700">
                            <label className="block text-sm text-gray-400 mb-4">1. Upload Raw Image (Any Format)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-700 border-dashed rounded-lg cursor-pointer hover:bg-neutral-700/50 hover:border-yellow-500/50 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> PNG, JPG, WEBP, SVG</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.heic,.svg" />
                            </label>
                        </div>
                    </div>

                    {/* Right: Validated Editor */}
                    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">2. Optimize & Preview</h3>

                        <div className="flex-1 bg-[url('/grid.png')] bg-repeat bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] border border-neutral-700 relative group">
                            {processedUrl ? (
                                <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain shadow-2xl" />
                            ) : (
                                <div className="text-neutral-500 text-sm">Image preview will appear here</div>
                            )}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="text-yellow-400 animate-pulse font-semibold">Removing Background...</div>
                                </div>
                            )}
                        </div>

                        {processedUrl && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <button
                                    onClick={handleRemoveBackground}
                                    disabled={isProcessing}
                                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                    Auto-Remove Background (ML)
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Brightness ({brightness}%)</label>
                                        <input
                                            type="range" min="50" max="150"
                                            value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                                            className="w-full accent-yellow-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Contrast ({contrast}%)</label>
                                        <input
                                            type="range" min="50" max="150"
                                            value={contrast} onChange={e => setContrast(Number(e.target.value))}
                                            className="w-full accent-yellow-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-neutral-700 flex items-center justify-between">
                    <p className={`text-sm ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || !processedUrl}
                        className={`px-8 py-3 rounded-full font-bold text-black transition-all transform ${uploading || !processedUrl
                                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {uploading ? 'Processing & Uploading...' : '💾 Save to Collection'}
                    </button>
                </div>
            </div>
        </div>
    );
}
