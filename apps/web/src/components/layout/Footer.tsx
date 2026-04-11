import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className="border-t border-luxury-gold/20 bg-gradient-to-b from-black to-neutral-950 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxury-champagne/20 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-6 group">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <svg className="w-10 h-10 text-luxury-gold" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-display font-bold text-gradient">
                                    JewelFit 3D
                                </span>
                                <span className="text-xs text-luxury-champagne/60 font-elegant tracking-widest">
                                    LUXURY VIRTUAL TRY-ON
                                </span>
                            </div>
                        </Link>
                        <p className="text-neutral-400 max-w-md leading-relaxed font-elegant">
                            Experience the future of jewelry shopping with our revolutionary AI-powered virtual try-on platform.
                            See how exquisite pieces look on you before you buy.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {[
                                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', label: 'Twitter' },
                                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', label: 'Facebook' },
                                { icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z', label: 'LinkedIn' },
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 glass-luxury rounded-full flex items-center justify-center hover:bg-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={social.label}
                                >
                                    <svg className="w-5 h-5 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-display font-semibold mb-6 text-white text-lg">Product</h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/try/photo', label: 'Photo Mode' },
                                { href: '/try/3d', label: '3D Experience' },
                                { href: '/products', label: 'Collection' },
                                { href: '/admin/upload', label: 'Upload Product' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-elegant flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-luxury-gold group-hover:w-4 transition-all duration-300" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-display font-semibold mb-6 text-white text-lg">Company</h3>
                        <ul className="space-y-3 mb-6">
                            {[
                                { href: '/about', label: 'About Us' },
                                { href: '/contact', label: 'Contact' },
                                { href: '/privacy', label: 'Privacy Policy' },
                                { href: '/terms', label: 'Terms of Service' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-elegant flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-luxury-gold group-hover:w-4 transition-all duration-300" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="text-neutral-500 font-elegant text-sm space-y-2">
                            <p>
                                123 Luxury Avenue,<br />
                                New York, NY 10001
                            </p>
                            <p className="text-luxury-gold/80">contact@jewelfit3d.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
