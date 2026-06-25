import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function CheckoutCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="pt-32 px-4 max-w-4xl mx-auto pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Cancel Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-8"
                    >
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.div>

                    {/* Cancel Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                            <span className="text-white">Payment</span>{' '}
                            <span className="text-gradient">Cancelled</span>
                        </h1>
                        <p className="text-2xl text-neutral-300 font-elegant mb-8">
                            Your order was not completed
                        </p>
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-luxury p-8 rounded-xl mb-12 max-w-2xl mx-auto"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <h2 className="text-xl font-display font-bold text-white mb-3">
                                    What happened?
                                </h2>
                                <p className="text-neutral-400 mb-4">
                                    You cancelled the payment process or something went wrong. No charges were made to your account.
                                </p>
                                <p className="text-neutral-400">
                                    Your items are still saved in your cart and you can complete your purchase whenever you're ready.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Common Issues */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mb-12 max-w-2xl mx-auto"
                    >
                        <h3 className="text-lg font-bold text-white mb-6">Common Issues</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="glass-dark p-6 rounded-lg text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <h4 className="font-bold text-white">Payment Method</h4>
                                </div>
                                <p className="text-sm text-neutral-400">
                                    Make sure your card details are correct and has sufficient funds
                                </p>
                            </div>

                            <div className="glass-dark p-6 rounded-lg text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <h4 className="font-bold text-white">Connection</h4>
                                </div>
                                <p className="text-sm text-neutral-400">
                                    Check your internet connection and try again
                                </p>
                            </div>

                            <div className="glass-dark p-6 rounded-lg text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h4 className="font-bold text-white">Security</h4>
                                </div>
                                <p className="text-sm text-neutral-400">
                                    Your bank may have declined the transaction for security reasons
                                </p>
                            </div>

                            <div className="glass-dark p-6 rounded-lg text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="font-bold text-white">Browser Issues</h4>
                                </div>
                                <p className="text-sm text-neutral-400">
                                    Try using a different browser or clearing your cache
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/cart"
                            className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Return to Cart
                        </Link>
                        <Link
                            href="/products"
                            className="glass-luxury px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-all rounded-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Continue Shopping
                        </Link>
                    </motion.div>

                    {/* Support */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-16 pt-8 border-t border-white/10"
                    >
                        <p className="text-neutral-400 mb-4">Need help with your order?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href="mailto:support@jewelfit.com"
                                className="flex items-center gap-2 text-luxury-gold hover:text-luxury-champagne transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                support@jewelfit.com
                            </a>
                            <span className="text-neutral-600">|</span>
                            <a
                                href="tel:+1234567890"
                                className="flex items-center gap-2 text-luxury-gold hover:text-luxury-champagne transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +1 (234) 567-890
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
