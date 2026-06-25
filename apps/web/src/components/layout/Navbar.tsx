import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [cartItemCount, setCartItemCount] = useState(0);

    // Get cart count on client side only to avoid hydration mismatch
    useEffect(() => {
        const count = useCartStore.getState().getItemCount();
        setCartItemCount(count);

        // Subscribe to cart changes
        const unsubscribe = useCartStore.subscribe((state) => {
            setCartItemCount(state.getItemCount());
        });

        return () => unsubscribe();
    }, []);

    // Fetch profile image when user is logged in
    useEffect(() => {
        if (session?.user?.email) {
            fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.profileImage) {
                        setProfileImage(data.profileImage);
                    }
                })
                .catch(err => console.error('Failed to load profile image:', err));
        }
    }, [session]);

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-luxury-gold/20"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Centered on mobile, left on desktop */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        {/* Profile Picture Icon (if logged in) */}
                        {session && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-champagne p-[2px] flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-luxury-gold">
                                            {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <motion.div
                            className="relative"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <svg className="w-10 h-10 text-luxury-gold" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            <div className="absolute inset-0 bg-luxury-gold/20 blur-xl group-hover:bg-luxury-gold/40 transition-all duration-300" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-gradient tracking-tight">
                                JewelFit 3D
                            </span>
                            <span className="text-xs text-luxury-champagne/60 font-elegant tracking-widest">
                                LUXURY VIRTUAL TRY-ON
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        <NavLink href="/products">Collection</NavLink>
                        <NavLink href="/try/photo">Photo Mode</NavLink>
                        <NavLink href="/try/3d">3D Jewelry</NavLink>

                        {/* Shopping Cart Icon */}
                        <Link href="/cart" className="relative px-4 py-2 text-white/80 hover:text-luxury-gold transition-all duration-300 group">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartItemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-gradient-to-r from-luxury-gold to-luxury-champagne text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </Link>

                        {session ? (
                            <>
                                <NavLink href="/account">My Account</NavLink>
                                {session.user?.email === 'demo@jewelfit.test' && (
                                    <NavLink href="/admin" className="text-luxury-gold">
                                        Admin
                                    </NavLink>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="ml-4 px-6 py-2.5 glass-luxury text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 text-sm"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="ml-4 px-6 py-2.5 text-white font-medium hover:text-luxury-gold transition-colors duration-300 text-sm"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-6 py-2.5 btn-primary text-sm font-semibold"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-full glass-luxury hover:bg-white/10 transition-all duration-300"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="lg:hidden glass-dark border-t border-luxury-gold/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 py-6 space-y-4">
                            <MobileNavLink href="/products">Collection</MobileNavLink>
                            <MobileNavLink href="/try/photo">Photo Mode</MobileNavLink>
                            <MobileNavLink href="/try/3d">3D Jewelry</MobileNavLink>
                            <MobileNavLink href="/cart">
                                Shopping Cart {cartItemCount > 0 && `(${cartItemCount})`}
                            </MobileNavLink>

                            {session ? (
                                <>
                                    <MobileNavLink href="/account">My Account</MobileNavLink>
                                    {session.user?.email === 'demo@jewelfit.test' && (
                                        <MobileNavLink href="/admin">Admin</MobileNavLink>
                                    )}
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-left px-4 py-3 text-white hover:text-luxury-gold transition-colors duration-300 font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileNavLink href="/auth/login">Sign In</MobileNavLink>
                                    <Link
                                        href="/auth/register"
                                        className="block btn-primary text-center py-3 text-sm font-semibold"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

// Desktop Nav Link Component
function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 text-white/80 hover:text-luxury-gold font-medium transition-all duration-300 text-sm relative group ${className}`}
        >
            {children}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-champagne group-hover:w-full transition-all duration-300" />
        </Link>
    );
}

// Mobile Nav Link Component
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block px-4 py-3 text-white hover:text-luxury-gold transition-colors duration-300 font-medium border-l-2 border-transparent hover:border-luxury-gold"
        >
            {children}
        </Link>
    );
}
