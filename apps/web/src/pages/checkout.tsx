import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import axios from 'axios';

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { items, getTotal, clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const subtotal = getTotal();
    const tax = subtotal * 0.08;
    const shipping = items.length > 0 ? 15 : 0;
    const total = subtotal + tax + shipping;

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [status, router]);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    const handlePlaceOrder = async () => {
        if (!session) {
            router.push('/auth/login?redirect=/checkout');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Prepare checkout items
            const checkoutItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                customization: {} // Add customization if needed
            }));

            // Create Stripe checkout session
            const response = await axios.post(
                '/api/checkout/create-session',
                { items: checkoutItems },
                {
                    headers: {
                        'Authorization': `Bearer ${(session as any).accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.url) {
                // Clear cart and redirect to Stripe
                clearCart();
                window.location.href = response.data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(
                err.response?.data?.error || 
                'Failed to create checkout session. Please try again.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="loading-spinner" />
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
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                        <span className="text-white">Secure</span>{' '}
                        <span className="text-gradient">Checkout</span>
                    </h1>
                    <p className="text-xl text-neutral-400 font-elegant">
                        Complete your order securely with Stripe
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass-luxury p-8 rounded-xl">
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-white/10">
                                        <div className="w-20 h-20 bg-gradient-to-br from-neutral-900 to-black rounded-lg p-2 flex items-center justify-center">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.placeholder-icon')) {
                                                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                                        svg.setAttribute('class', 'w-12 h-12 text-luxury-gold/30 placeholder-icon');
                                                        svg.setAttribute('viewBox', '0 0 200 200');
                                                        svg.setAttribute('fill', 'currentColor');
                                                        svg.innerHTML = `
                                                            <path d="M100 20 L140 60 L120 140 L100 160 L80 140 L60 60 Z" 
                                                                  stroke="currentColor" 
                                                                  stroke-width="3" 
                                                                  fill="none" />
                                                            <circle cx="100" cy="100" r="4" fill="currentColor" />
                                                        `;
                                                        parent.appendChild(svg);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-white">{item.name}</h3>
                                            <p className="text-sm text-neutral-400">{item.category}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm text-neutral-400">Qty: {item.quantity}</span>
                                                <span className="font-bold text-gradient">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-white">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Tax (8%)</span>
                                    <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-white">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-xl font-bold text-white">Total</span>
                                    <span className="text-3xl font-bold text-gradient">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="glass-luxury p-8 rounded-xl">
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Customer Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-neutral-400">Name:</span>
                                    <span className="ml-2 text-white font-semibold">{session?.user?.name || 'Guest'}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400">Email:</span>
                                    <span className="ml-2 text-white font-semibold">{session?.user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-32 h-fit"
                    >
                        <div className="glass-luxury p-8 rounded-xl">
                            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Method
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="glass-dark p-6 rounded-lg mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <svg className="w-12 h-12 text-luxury-gold" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                        </svg>
                                        <div>
                                            <h3 className="font-bold text-white">Secure Payment with Stripe</h3>
                                            <p className="text-sm text-neutral-400">Your payment information is encrypted and secure</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <img src="/api/placeholder/40/25" alt="Visa" className="h-8 bg-white rounded" />
                                        <img src="/api/placeholder/40/25" alt="Mastercard" className="h-8 bg-white rounded" />
                                        <img src="/api/placeholder/40/25" alt="Amex" className="h-8 bg-white rounded" />
                                    </div>
                                </div>

                                <ul className="space-y-2 text-sm text-neutral-400 mb-6">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        256-bit SSL encryption
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        PCI DSS compliant
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Secure payment processing
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="w-full py-4 btn-primary text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="loading-spinner w-5 h-5" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Place Order - ${total.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-neutral-500 text-center">
                                By placing this order, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
