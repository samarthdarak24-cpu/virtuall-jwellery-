import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCartStore } from '@/store/cartStore';

interface WebProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description?: string;
}

export default function Products() {
    const [products, setProducts] = useState<WebProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/api/products?t=${Date.now()}`);
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('API Error', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter(p => {
        if (filter === 'all') return true;
        const cat = p.category.toLowerCase();
        if (filter === 'necklaces') return cat.includes('necklace');
        if (filter === 'earrings') return cat.includes('earring');
        if (filter === 'rings') return cat.includes('ring');
        if (filter === 'bracelets') return cat.includes('bracelet');
        return true;
    });

    const handleDelete = async (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        try {
            await axios.delete(`/api/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Failed to delete product. It may have been removed already.');
            fetchProducts();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="pt-32 px-4 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-3">
                            <span className="text-white">Our</span>{' '}
                            <span className="text-gradient">Collection</span>
                        </h1>
                        <p className="text-xl text-neutral-400 font-elegant">
                            Exquisite jewelry ready for virtual try-on
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link
                            href="/admin/upload"
                            className="btn-secondary flex items-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Product
                        </Link>
                    </motion.div>
                </div>

                {/* Filters */}
                <motion.div
                    className="flex gap-3 mb-12 overflow-x-auto pb-2 custom-scrollbar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {[
                        { id: 'all', label: 'All Jewelry', icon: '💎' },
                        { id: 'necklaces', label: 'Necklaces', icon: '📿' },
                        { id: 'earrings', label: 'Earrings', icon: '💍' },
                        { id: 'rings', label: 'Rings', icon: '💍' },
                        { id: 'bracelets', label: 'Bracelets', icon: '⌚' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 flex items-center gap-2 font-medium ${filter === cat.id
                                ? 'bg-gradient-to-r from-luxury-gold via-luxury-champagne to-luxury-gold text-black shadow-gold'
                                : 'glass-luxury text-white hover:bg-white/10 hover:border-luxury-gold/40'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="loading-spinner mb-6" />
                        <p className="text-neutral-400 font-elegant text-lg">Loading exquisite pieces...</p>
                    </div>
                ) : (
                    <motion.div
                        key={filter}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatePresence mode="wait">
                            {filtered.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filtered.length === 0 && (
                    <motion.div
                        className="text-center py-32"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-6">💎</div>
                        <h3 className="text-2xl font-display font-bold text-white mb-3">
                            No jewelry found
                        </h3>
                        <p className="text-neutral-400 font-elegant">
                            Try selecting a different category
                        </p>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
}

// Product Card Component
function ProductCard({ product, index, onDelete }: {
    product: WebProduct;
    index: number;
    onDelete: (id: string) => void;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [showAddedNotification, setShowAddedNotification] = useState(false);
    const [imageError, setImageError] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category
        });

        setShowAddedNotification(true);
        setTimeout(() => setShowAddedNotification(false), 2000);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="card-product group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-gradient-to-br from-neutral-900 to-black p-6 overflow-hidden">
                {!imageError ? (
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain relative z-10"
                        onError={handleImageError}
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0
                        }}
                        transition={{ duration: 0.4 }}
                    />
                ) : (
                    <motion.div
                        className="w-full h-full flex items-center justify-center relative z-10"
                        animate={{
                            scale: isHovered ? 1.05 : 1,
                        }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Jewelry Placeholder SVG */}
                        <svg 
                            className="w-32 h-32 text-luxury-gold/40" 
                            viewBox="0 0 200 200" 
                            fill="currentColor"
                        >
                            {/* Diamond/Gem Icon */}
                            <path d="M100 20 L140 60 L120 140 L100 160 L80 140 L60 60 Z" 
                                  stroke="currentColor" 
                                  strokeWidth="3" 
                                  fill="none" 
                                  className="animate-pulse" />
                            <path d="M60 60 L100 100 L140 60" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  opacity="0.5" />
                            <path d="M80 140 L100 100 L120 140" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  opacity="0.5" />
                            <circle cx="100" cy="100" r="4" fill="currentColor" />
                        </svg>
                    </motion.div>
                )}

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Delete Button */}
                <motion.button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!product.id) return alert('Error: Invalid Product ID');
                        if (confirm(`Delete "${product.name}"?`)) {
                            onDelete(product.id);
                        }
                    }}
                    className="absolute top-3 left-3 bg-red-600/90 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg z-20 backdrop-blur-sm transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete Product"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </motion.button>

                {/* Category Badge */}
                <div className="absolute top-3 right-3 glass-dark px-3 py-1.5 rounded-full text-xs font-medium text-luxury-champagne border border-luxury-gold/30">
                    {product.category.toUpperCase()}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-6 relative z-10">
                <h3 className="font-display font-bold text-xl mb-2 text-white truncate group-hover:text-gradient transition-all duration-300">
                    {product.name}
                </h3>

                <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold text-gradient">
                        ${product.price.toLocaleString()}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Add to Cart Button */}
                    <motion.button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 bg-gradient-to-r from-luxury-gold via-luxury-champagne to-luxury-gold text-black font-bold rounded-lg hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add to Cart</span>
                        {showAddedNotification && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-green-500 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added!
                            </motion.div>
                        )}
                    </motion.button>

                    {/* Try On Button */}
                    <Link
                        href={`/try/photo?product=${product.id}&img=${encodeURIComponent(product.image)}&cat=${product.category}`}
                        className="block w-full py-3.5 glass-luxury text-white text-center font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Try On Now
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
