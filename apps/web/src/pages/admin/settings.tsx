import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function AdminSettings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'email' | 'payment' | 'security'>('general');
    const [settings, setSettings] = useState({
        siteName: 'JewelFit 3D',
        siteDescription: 'Luxury Virtual Try-On Experience',
        contactEmail: 'support@jewelfit.test',
        currency: 'USD',
        taxRate: 8.5,
        shippingFee: 15,
        freeShippingThreshold: 100,
        emailNotifications: true,
        orderConfirmation: true,
        shippingUpdates: true,
        marketingEmails: false,
        stripeEnabled: true,
        paypalEnabled: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
    });
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin/settings');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        } else if (status === 'authenticated') {
            setLoading(false);
        }
    }, [status, session, router]);

    const handleSave = () => {
        // Save settings logic here
        setSaveMessage('✅ Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading settings...</p>
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
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1.2, 0.5],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            <Navbar />

            <main className="relative pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-gradient mb-2">Platform Settings</h1>
                    <p className="text-gray-400">Configure your JewelFit 3D platform</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-luxury rounded-2xl p-4 border border-white/10 space-y-2">
                            {[
                                { id: 'general', label: 'General', icon: '⚙️' },
                                { id: 'email', label: 'Email', icon: '📧' },
                                { id: 'payment', label: 'Payment', icon: '💳' },
                                { id: 'security', label: 'Security', icon: '🔒' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-luxury-gold text-black font-bold'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="glass-luxury rounded-3xl p-8 border border-white/10">
                            {activeTab === 'general' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold text-luxury-gold mb-6">General Settings</h2>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Site Name</label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Site Description</label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
                                        <input
                                            type="email"
                                            value={settings.contactEmail}
                                            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Currency</label>
                                            <select
                                                value={settings.currency}
                                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={settings.taxRate}
                                                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Shipping Fee ($)</label>
                                            <input
                                                type="number"
                                                value={settings.shippingFee}
                                                onChange={(e) => setSettings({ ...settings, shippingFee: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Free Shipping Threshold ($)</label>
                                            <input
                                                type="number"
                                                value={settings.freeShippingThreshold}
                                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'email' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold text-luxury-gold mb-6">Email Notifications</h2>

                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-bold text-white mb-1">Email Notifications</div>
                                                <div className="text-sm text-gray-400">Enable all email notifications</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                className="w-5 h-5 accent-luxury-gold"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-bold text-white mb-1">Order Confirmation</div>
                                                <div className="text-sm text-gray-400">Send confirmation emails for new orders</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.orderConfirmation}
                                                onChange={(e) => setSettings({ ...settings, orderConfirmation: e.target.checked })}
                                                className="w-5 h-5 accent-luxury-gold"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-bold text-white mb-1">Shipping Updates</div>
                                                <div className="text-sm text-gray-400">Notify customers about shipping status</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.shippingUpdates}
                                                onChange={(e) => setSettings({ ...settings, shippingUpdates: e.target.checked })}
                                                className="w-5 h-5 accent-luxury-gold"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-bold text-white mb-1">Marketing Emails</div>
                                                <div className="text-sm text-gray-400">Send promotional and marketing emails</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.marketingEmails}
                                                onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                                                className="w-5 h-5 accent-luxury-gold"
                                            />
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'payment' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold text-luxury-gold mb-6">Payment Methods</h2>

                                    <div className="space-y-4">
                                        <div className="p-6 bg-black/40 rounded-xl border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                                                        💳
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">Stripe</div>
                                                        <div className="text-sm text-gray-400">Credit & Debit Cards</div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.stripeEnabled}
                                                        onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                                                </label>
                                            </div>
                                            {settings.stripeEnabled && (
                                                <div className="space-y-3 pt-4 border-t border-white/10">
                                                    <input
                                                        type="text"
                                                        placeholder="Stripe Publishable Key"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-luxury-gold outline-none transition-colors"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Stripe Secret Key"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-luxury-gold outline-none transition-colors"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-black/40 rounded-xl border border-white/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                                                        💰
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">PayPal</div>
                                                        <div className="text-sm text-gray-400">PayPal Payments</div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.paypalEnabled}
                                                        onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold text-luxury-gold mb-6">Security Settings</h2>

                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-bold text-white mb-1">Two-Factor Authentication</div>
                                                <div className="text-sm text-gray-400">Require 2FA for admin accounts</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.twoFactorAuth}
                                                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                                                className="w-5 h-5 accent-luxury-gold"
                                            />
                                        </label>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Session Timeout (minutes)</label>
                                            <input
                                                type="number"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="p-6 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">⚠️</span>
                                                <div>
                                                    <div className="font-bold text-yellow-400 mb-2">Security Recommendations</div>
                                                    <ul className="text-sm text-gray-400 space-y-1">
                                                        <li>• Enable two-factor authentication for all admin accounts</li>
                                                        <li>• Use strong, unique passwords for all accounts</li>
                                                        <li>• Regularly review user access and permissions</li>
                                                        <li>• Keep your platform and dependencies up to date</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Save Button */}
                            <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
                                {saveMessage && (
                                    <div className="text-green-400 font-bold">{saveMessage}</div>
                                )}
                                <button
                                    onClick={handleSave}
                                    className="ml-auto px-8 py-3 bg-luxury-gold text-black font-bold rounded-xl hover:bg-white transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
