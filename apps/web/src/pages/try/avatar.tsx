import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '@/components/layout/Navbar';
import RealTimeTryOn from '@/components/realtime/RealTimeTryOn';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
}

type TryOnMode = 'realtime';

export default function AvatarTryOn() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductImg, setSelectedProductImg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Load products
  useEffect(() => {
    axios
      .get('/api/products')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch products:', err));
  }, []);

  // Handle query params
  useEffect(() => {
    if (!router.isReady) return;
    const { img, cat } = router.query;
    if (img && typeof img === 'string') {
      setSelectedProductImg(decodeURIComponent(img));
    }
    if (cat && typeof cat === 'string') {
      setSelectedCategory(cat);
      setFilterCategory(cat);
    }
  }, [router.isReady, router.query]);

  const handleProductSelect = (p: Product) => {
    if (selectedProductImg === p.image) {
      // Deselect
      setSelectedProductImg(null);
      setSelectedCategory(null);
    } else {
      setSelectedProductImg(p.image);
      setSelectedCategory(p.category);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      !filterCategory ||
      (p.category && p.category.toLowerCase().includes(filterCategory.toLowerCase()))
  );

  const categories = ['All', 'Necklace', 'Earring', 'Ring', 'Bracelet'];

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans overflow-x-hidden relative">
      <Head>
        <title>Real-Time Try-On | JewelFit 3D</title>
        <meta
          name="description"
          content="Try on jewelry in real-time using your webcam with AI-powered face, hand, and body tracking."
        />
      </Head>

      <Navbar />

      <main className="relative pt-24 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="text-white">Real-Time</span>{' '}
            <span className="text-gradient">Try-On</span>
          </h1>
          <p className="text-neutral-400 font-elegant text-lg max-w-2xl mx-auto">
            See how jewelry looks on you instantly with AI-powered tracking
          </p>
        </motion.div>

        {/* Mode indicator pills */}
        <div className="flex justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Live Webcam
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Face Tracking • Hand Tracking • Pose Detection
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr,380px] gap-6">
          {/* Left: Try-On viewport */}
          <div className="lg:col-span-1">
            <RealTimeTryOn
              productAssetUrl={selectedProductImg}
              category={selectedCategory}
            />
          </div>

          {/* Right: Jewelry sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-neutral-900 to-black border border-luxury-gold/10 rounded-3xl h-[650px] flex flex-col shadow-2xl z-10 relative">
              <div className="px-6 pt-6">
                <h3 className="text-2xl font-display font-bold mb-4 text-white flex items-center gap-2">
                  <span>💎</span> Select Jewelry
                </h3>

                {/* Category filter pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setFilterCategory(
                          cat === 'All' ? null : cat.toLowerCase()
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        (filterCategory === cat.toLowerCase()) ||
                        (cat === 'All' && !filterCategory)
                          ? 'bg-luxury-gold text-black border-luxury-gold'
                          : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-luxury-gold/50 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductImg === p.image;

                    return (
                      <motion.button
                        layout
                        key={p.id}
                        onClick={() => handleProductSelect(p)}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                          isSelected
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
                          <div className="font-semibold text-white mb-1">
                            {p.name}
                          </div>
                          <div className="text-sm text-luxury-gold font-bold">
                            ${p.price}
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-white/5 rounded text-[9px] text-neutral-400 uppercase tracking-wider mt-1">
                            {p.category}
                          </span>
                        </div>
                        {isSelected ? (
                          <svg
                            className="w-6 h-6 text-luxury-gold shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6 text-neutral-600 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>

                {products.length === 0 && (
                  <div className="text-neutral-500 text-center mt-10 font-elegant">
                    Loading products...
                  </div>
                )}

                {products.length > 0 && filteredProducts.length === 0 && (
                  <div className="text-neutral-500 text-center mt-10 font-elegant">
                    No products in this category.
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="p-6 border-t border-luxury-gold/20">
                <div className="text-xs text-luxury-champagne/80 bg-luxury-gold/10 p-4 rounded-xl border border-luxury-gold/20">
                  <strong className="text-luxury-gold">💡 Tips:</strong>
                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-neutral-400">
                    <li>Face the camera for earrings & necklaces</li>
                    <li>Show your hand for rings & bracelets</li>
                    <li>Good lighting improves tracking accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
