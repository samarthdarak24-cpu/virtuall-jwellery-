import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

    // State for all form fields
    const [formData, setFormData] = useState({
        fullName: session?.user?.name || '',
        phone: '',
        dob: '',
        gender: '',
        ringSize: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
    });
    const [loading, setLoading] = useState(false);

    // Mock Data for "Saved Looks" or History
    const savedLooks = [
        { id: 1, name: 'Platinum Solitaire', date: 'Dec 4, 2025', image: '/seed/ring.svg', category: 'Ring' },
        { id: 2, name: 'Gold Necklace', date: 'Dec 5, 2025', image: '/uploads/file-1764964115488-540841491.png', category: 'Necklace' },
    ];

    const [profileImage, setProfileImage] = useState<string | null>(session?.user?.image || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/account');
        }
    }, [status, router]);

    // Fetch saved profile on mount
    useEffect(() => {
        if (session?.user?.email) {
            fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData(prev => ({
                            ...prev,
                            fullName: data.fullName || session.user?.name || '',
                            phone: data.phone || '',
                            dob: data.dob || '',
                            gender: data.gender || '',
                            ringSize: data.ringSize || '',
                            address: data.address || '',
                            city: data.city || '',
                            country: data.country || '',
                            postalCode: data.postalCode || '',
                        }));
                        if (data.profileImage) {
                            setProfileImage(data.profileImage);
                        }
                    }
                })
                .catch(err => console.error('Failed to load profile:', err));
        }
    }, [session]);

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your account...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-3xl font-display text-gradient mb-6">Create Your Account</h1>
                    <p className="text-neutral-400 mb-8 max-w-md text-center">
                        Join JewelFit 3D to save your favorite try-ons, track your history, and get personalized recommendations.
                    </p>
                    <Link href="/auth/login" className="btn-primary">
                        Sign In / Register
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!session?.user?.email) {
            alert('Session expired. Please login again.');
            return;
        }

        setLoading(true);
        try {
            console.log('Saving profile data:', formData);
            
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session.user.email, // Include email in request body
                    ...formData,
                    profileImage // Send base64 image
                }),
            });
            
            const data = await res.json();
            console.log('Save response:', data);
            
            if (!res.ok) {
                throw new Error(data.error || data.details || 'Failed to save profile');
            }
            
            // Show success message
            const btn = document.getElementById('save-button');
            if (btn) {
                const originalClasses = btn.className;
                btn.innerText = '✅ Saved!';
                btn.className = btn.className.replace('bg-luxury-gold', 'bg-green-500');
                setTimeout(() => {
                    btn.innerText = 'Save Changes';
                    btn.className = originalClasses;
                }, 2000);
            }
        } catch (error: any) {
            console.error('Error saving profile:', error);
            alert(`Failed to save profile: ${error?.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />

            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-luxury-gold via-white to-luxury-gold p-[2px] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-display text-luxury-gold">
                                            {formData.fullName?.[0] || 'U'}
                                        </span>
                                    )}

                                    {/* Overlay for uploading */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                                {formData.fullName || 'Valued Client'}
                            </h1>
                            <p className="text-luxury-champagne">{session.user?.email}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Tabs & Content */}
                <div className="grid lg:grid-cols-[250px,1fr] gap-8">
                    {/* Sidebar Tabs */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
                        <TabButton
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            label="My Profile"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        />
                        <TabButton
                            active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                            label="Saved Looks"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="glass-luxury rounded-3xl p-6 sm:p-8 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-display text-luxury-gold">Personal Details</h2>
                                            <button
                                                id="save-button"
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="px-6 py-2 bg-luxury-gold text-black font-bold rounded-lg hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Full Name</label>
                                                <input
                                                    name="fullName"
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Email Address</label>
                                                <input
                                                    type="text"
                                                    defaultValue={session.user?.email || ''}
                                                    disabled
                                                    className="input-field opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Phone Number</label>
                                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Date of Birth</label>
                                                <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field appearance-none hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Prefer not to say">Prefer not to say</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Ring Size</label>
                                                <select name="ringSize" value={formData.ringSize} onChange={handleChange} className="input-field appearance-none hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors">
                                                    <option value="">Unknown</option>
                                                    <option value="US 4">US 4</option>
                                                    <option value="US 5">US 5</option>
                                                    <option value="US 6">US 6</option>
                                                    <option value="US 7">US 7</option>
                                                    <option value="US 8">US 8</option>
                                                    <option value="US 9">US 9</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Address Line 1</label>
                                                <input name="address" type="text" value={formData.address} onChange={handleChange} placeholder="123 Luxury Blvd" className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">City</label>
                                                <input name="city" type="text" value={formData.city} onChange={handleChange} placeholder="New York" className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Country</label>
                                                <input name="country" type="text" value={formData.country} onChange={handleChange} placeholder="United States" className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-neutral-400">Postal Code</label>
                                                <input name="postalCode" type="text" value={formData.postalCode} onChange={handleChange} placeholder="10001" className="input-field hover:border-luxury-gold/50 focus:border-luxury-gold transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-xl">
                                        <h3 className="text-luxury-gold font-semibold mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Early Access Member
                                        </h3>
                                        <p className="text-sm text-neutral-400">
                                            You have exclusive access to our Beta 3D Try-On features.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-display text-luxury-gold mb-6">Saved Try-On Looks</h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {savedLooks.map(look => (
                                            <div key={look.id} className="group relative bg-black/40 rounded-xl overflow-hidden border border-white/5 hover:border-luxury-gold/50 transition-all duration-300">
                                                <div className="aspect-square bg-white/5 p-4 flex items-center justify-center">
                                                    <img src={look.image} alt={look.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="p-4">
                                                    <div className="text-xs text-luxury-gold mb-1 uppercase tracking-wider">{look.category}</div>
                                                    <h3 className="font-semibold text-white group-hover:text-luxury-gold transition-colors">{look.name}</h3>
                                                    <p className="text-xs text-neutral-500 mt-2">Tried on {look.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${active
                ? 'bg-luxury-gold text-black font-bold shadow-lg shadow-luxury-gold/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
