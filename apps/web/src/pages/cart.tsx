import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = getTotal();
    const tax = subtotal * 0.08; // 8% tax
    const shipping = items.length > 0 ? 15 : 0; // $15 flat shipping
    const total = subtotal + tax + shipping;

    const handleCheckout = async () => {
        if (!session) {
            router.push('/auth/login?redirect=/cart');
            return;
        }

        setIsProcessing(true);
        try {
            // Proceed to checkout page
            router.push('/checkout');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to proceed to checkout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 px-4 max-w-7xl mx-auto pb-20">
                    <motion.div
                        className="text-center py-32"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-6xl mb-6">🛒</div>
                        <h1 className="text-4xl font-display font-bold text-white mb-4">
                            Your Cart is Empty
                        </h1>
                        <p className="text-neutral-400 font-elegant text-lg mb-8">
                            Discover our exquisite jewelry collection
                        </p>
                        <Link href="/products" className="btn-primary inline-block px-8 py-4 text-lg">
                            Browse Collection
                        </Link>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="pt-32 px-4 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-5xl md:text-6xl font-display font-bold">
                            <span className="text-white">Shopping</span>{' '}
                            <span className="text-gradient">Cart</span>
                        </h1>
                        <button
                            onClick={() => {
                                if (confirm('Clear all items from cart?')) {
                                    clearCart();
                                }
                            }}
                            className="text-red-400 hover:text-red-300 font-medium flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Cart
                        </button>
                    </div>
                    <p className="text-xl text-neutral-400 font-elegant">
                        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-luxury p-6 rounded-xl flex gap-6 group hover:border-luxury-gold/40 transition-all"
                                >
                                    {/* Product Image */}
                                    <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-neutral-900 to-black rounded-lg p-4 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                // Replace with placeholder SVG
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent && !parent.querySelector('.placeholder-icon')) {
                                                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                                    svg.setAttribute('class', 'w-16 h-16 text-luxury-gold/30 placeholder-icon');
                                                    svg.setAttribute('viewBox', '0 0 200 200');
                                                    svg.setAttribute('fill', 'currentColor');
                                                    svg.innerHTML = `
                                                        <path d="M100 20 L140 60 L120 140 L100 160 L80 140 L60 60 Z" 
                                                              stroke="currentColor" 
                                                              stroke-width="3" 
                                                              fill="none" />
                                                        <path d="M60 60 L100 100 L140 60" 
                                                              stroke="currentColor" 
                                                              stroke-width="2" 
                                                              opacity="0.5" />
                                                        <circle cx="100" cy="100" r="4" fill="currentColor" />
                                                    `;
                                                    parent.appendChild(svg);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-display font-bold text-white mb-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-neutral-400 uppercase tracking-wide">
                                                    {item.category}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Remove from cart"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-neutral-400">Quantity:</span>
                                                <div className="flex items-center glass-dark rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="px-4 py-2 hover:bg-white/10 transition-colors rounded-l-lg"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="px-6 py-2 font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="px-4 py-2 hover:bg-white/10 transition-colors rounded-r-lg"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gradient">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div className="text-sm text-neutral-400">
                                                        ${item.price.toLocaleString()} each
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-luxury p-8 rounded-xl sticky top-32"
                        >
                            <h2 className="text-2xl font-display font-bold text-white mb-6">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-white">
                                        ${subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Tax (8%)</span>
                                    <span className="font-semibold text-white">
                                        ${tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-white">
                                        ${shipping.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold text-white">Total</span>
                                <span className="text-3xl font-bold text-gradient">
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full py-4 btn-primary text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="loading-spinner w-5 h-5" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Proceed to Checkout
                                    </>
                                )}
                            </button>

                            {!session && (
                                <p className="text-sm text-neutral-400 text-center mt-4">
                                    You'll be asked to sign in at checkout
                                </p>
                            )}

                            <Link
                                href="/products"
                                className="block w-full text-center py-3 mt-4 text-luxury-gold hover:text-luxury-champagne font-medium transition-colors"
                            >
                                ← Continue Shopping
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
