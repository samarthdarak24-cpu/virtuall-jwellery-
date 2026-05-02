import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function AdminProducts() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin/products');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.email === 'demo@jewelfit.test') {
            loadProducts();
        }
    }, [session]);

    const loadProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    const handleUpdate = async (product: any) => {
        try {
            await axios.put(`/api/products/${product.id}`, product);
            setProducts(products.map(p => p.id === product.id ? product : p));
            setEditingProduct(null);
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading products...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user?.email !== 'demo@jewelfit.test') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-gray-900 relative overflow-hidden">
            {/* Animated Gold Particles Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <Navbar />

            <main className="relative pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">Manage Products</h1>
                        <p className="text-gray-600 font-medium">Edit, delete, or update your jewelry collection</p>
                    </div>
                    <Link href="/admin/upload">
                        <button className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-yellow-500/30 transition-all">
                            + Add New Product
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 mb-8 border-2 border-yellow-200 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-2 font-semibold">Search Products</label>
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-2 font-semibold">Filter by Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-colors"
                            >
                                <option value="all">All Categories</option>
                                <option value="necklace">Necklace</option>
                                <option value="earring">Earring</option>
                                <option value="ring">Ring</option>
                                <option value="bracelet">Bracelet</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all group shadow-lg hover:shadow-xl hover:shadow-yellow-500/20"
                            >
                                {/* Product Image */}
                                <div className="aspect-square bg-gradient-to-br from-amber-50 to-yellow-50 p-4 relative overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-yellow-100 backdrop-blur-sm rounded-full text-xs font-bold text-yellow-700 border border-yellow-300">
                                        {product.category}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">${product.price}</p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingProduct(product)}
                                            className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-xl hover:bg-blue-200 transition-all font-bold text-sm"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(product.id)}
                                            className="flex-1 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-xl hover:bg-red-200 transition-all font-bold text-sm"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full border-2 border-yellow-300 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-6">Edit Product</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2 font-semibold">Product Name</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-2 font-semibold">Price ($)</label>
                                    <input
                                        type="number"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 mb-2 font-semibold">Category</label>
                                    <select
                                        value={editingProduct.category}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 outline-none transition-colors"
                                    >
                                        <option value="necklace">Necklace</option>
                                        <option value="earring">Earring</option>
                                        <option value="ring">Ring</option>
                                        <option value="bracelet">Bracelet</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => handleUpdate(editingProduct)}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-yellow-500/30 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setEditingProduct(null)}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-red-300 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">⚠️</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Product?</h2>
                                <p className="text-gray-600 mb-6">This action cannot be undone. The product will be permanently removed from your collection.</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleDelete(showDeleteConfirm)}
                                        className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
