import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useState, useEffect } from 'react';

export default function Home() {
    const { data: session } = useSession();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />

                    {/* Floating Gold Orbs */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: mousePosition.x * 0.02,
                            y: mousePosition.y * 0.02,
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-champagne/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1.3, 1, 1.3],
                            opacity: [0.4, 0.2, 0.4],
                            x: -mousePosition.x * 0.02,
                            y: -mousePosition.y * 0.02,
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Luxury Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: `linear-gradient(#DAA520 1px, transparent 1px), linear-gradient(90deg, #DAA520 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    {/* Luxury Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-6 py-2 glass-luxury rounded-full mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
                        <span className="text-luxury-champagne text-sm font-medium tracking-wider">
                            PREMIUM VIRTUAL TRY-ON EXPERIENCE
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="text-white">Experience</span>
                        <br />
                        <span className="text-gradient">Luxury Jewelry</span>
                        <br />
                        <span className="text-white">Virtually</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-3xl mx-auto font-elegant leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Discover how exquisite jewelry looks on you with our revolutionary AI-powered virtual try-on technology.
                        See every detail in stunning 3D or try it on your photo instantly.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link href="/try/photo" className="btn-primary text-lg px-10 py-5 flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Try Photo Mode
                        </Link>
                        <Link href="/try/3d" className="btn-secondary text-lg px-10 py-5 flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Explore 3D
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-16 flex flex-wrap justify-center gap-8 text-neutral-500 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>AI-Powered Precision</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Photorealistic 3D</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-luxury-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Instant Try-On</span>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-luxury-gold/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-luxury-gold rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                            <span className="text-gradient">Dual-Mode</span> <span className="text-white">Experience</span>
                        </h2>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-elegant">
                            Choose your preferred way to explore our exquisite collection
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Photo Mode Card */}
                        <FeatureCard
                            icon={
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                            title="Photo Mode"
                            description="Upload your photo or use your camera for instant virtual try-on. Our AI precisely positions jewelry with realistic lighting and shadows."
                            features={[
                                "Real-time face & hand detection",
                                "Automatic jewelry positioning",
                                "Manual adjustment controls",
                                "Save & share your looks"
                            ]}
                            link="/try/photo"
                        />

                        {/* 3D Mode Card */}
                        <FeatureCard
                            icon={
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            }
                            title="3D Experience"
                            description="Explore jewelry in stunning photorealistic 3D. Customize materials, gemstones, and lighting to see every exquisite detail."
                            features={[
                                "Photorealistic PBR materials",
                                "Real-time material customization",
                                "HDRI environment lighting",
                                "360° rotation & zoom"
                            ]}
                            link="/try/3d"
                        />
                    </div>
                </div>
            </section>

            {/* Collection Preview */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-luxury-gold/5 to-black" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                            <span className="text-white">Featured</span> <span className="text-gradient">Collection</span>
                        </h2>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-elegant mb-12">
                            Discover our curated selection of exquisite jewelry pieces
                        </p>
                        <Link href="/products" className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3">
                            Browse Full Catalog
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="glass-luxury rounded-3xl p-12 md:p-16 luxury-shadow-lg"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            <span className="text-gradient">Ready to Experience</span>
                            <br />
                            <span className="text-white">Luxury Jewelry?</span>
                        </h2>
                        <p className="text-xl text-neutral-400 mb-10 font-elegant">
                            {session
                                ? "Welcome back! Continue exploring our exquisite collection."
                                : "Join us today and discover how jewelry looks on you before you buy."
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            {!session && (
                                <Link href="/auth/register" className="btn-primary text-lg px-10 py-5">
                                    Get Started Free
                                </Link>
                            )}
                            <Link href="/products" className="btn-secondary text-lg px-10 py-5">
                                Explore Collection
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

// Feature Card Component
function FeatureCard({ icon, title, description, features, link }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    link: string;
}) {
    return (
        <motion.div
            className="card-product p-8 md:p-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
        >
            <div className="text-luxury-gold mb-6">{icon}</div>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">{title}</h3>
            <p className="text-neutral-400 mb-8 leading-relaxed font-elegant text-lg">
                {description}
            </p>
            <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-luxury-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-300">{feature}</span>
                    </li>
                ))}
            </ul>
            <Link href={link} className="btn-outline w-full justify-center flex items-center gap-2">
                Try Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        </motion.div>
    );
}
