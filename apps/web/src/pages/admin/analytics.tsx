import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function AdminAnalytics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days');

    const analytics = {
        overview: {
            totalRevenue: 125000,
            totalOrders: 42,
            avgOrderValue: 2976,
            conversionRate: 3.2,
        },
        tryOnStats: {
            photoMode: 1250,
            threeDMode: 890,
            totalTryOns: 2140,
        },
        popularProducts: [
            { name: 'Gold Necklace', views: 450, tryOns: 120, sales: 15 },
            { name: 'Diamond Earrings', views: 380, tryOns: 95, sales: 12 },
            { name: 'Platinum Ring', views: 320, tryOns: 85, sales: 10 },
            { name: 'Silver Bracelet', views: 280, tryOns: 70, sales: 8 },
        ],
        categoryBreakdown: [
            { category: 'Necklace', percentage: 35, sales: 18 },
            { category: 'Earring', percentage: 30, sales: 15 },
            { category: 'Ring', percentage: 25, sales: 12 },
            { category: 'Bracelet', percentage: 10, sales: 5 },
        ],
        recentMetrics: [
            { date: 'May 2', revenue: 5200, orders: 3, tryOns: 45 },
            { date: 'May 1', revenue: 8900, orders: 5, tryOns: 62 },
            { date: 'Apr 30', revenue: 12400, orders: 7, tryOns: 78 },
            { date: 'Apr 29', revenue: 6700, orders: 4, tryOns: 51 },
            { date: 'Apr 28', revenue: 9800, orders: 6, tryOns: 69 },
        ],
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin/analytics');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        } else if (status === 'authenticated') {
            setLoading(false);
        }
    }, [status, session, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading analytics...</p>
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-gradient mb-2">Analytics Dashboard</h1>
                        <p className="text-gray-400">Track performance and user engagement</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="mt-4 md:mt-0 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <MetricCard
                        title="Total Revenue"
                        value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
                        change="+12.5%"
                        positive={true}
                        icon="💰"
                        color="from-green-500 to-green-600"
                    />
                    <MetricCard
                        title="Total Orders"
                        value={analytics.overview.totalOrders}
                        change="+8.3%"
                        positive={true}
                        icon="📦"
                        color="from-blue-500 to-blue-600"
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={`$${analytics.overview.avgOrderValue.toLocaleString()}`}
                        change="+5.2%"
                        positive={true}
                        icon="💳"
                        color="from-purple-500 to-purple-600"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${analytics.overview.conversionRate}%`}
                        change="-0.5%"
                        positive={false}
                        icon="📈"
                        color="from-yellow-500 to-yellow-600"
                    />
                </div>

                {/* Try-On Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-luxury rounded-3xl p-8 border border-white/10 mb-12"
                >
                    <h2 className="text-2xl font-display font-bold mb-6 text-luxury-gold">Virtual Try-On Usage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">📸</span>
                                <span className="text-sm text-gray-400">Photo Mode</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">{analytics.tryOnStats.photoMode.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Sessions</div>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">🎨</span>
                                <span className="text-sm text-gray-400">3D Mode</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">{analytics.tryOnStats.threeDMode.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Sessions</div>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-6 border border-luxury-gold/30">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">✨</span>
                                <span className="text-sm text-gray-400">Combined</span>
                            </div>
                            <div className="text-3xl font-bold text-luxury-gold mb-2">{analytics.tryOnStats.totalTryOns.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Try-Ons</div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Popular Products */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-luxury rounded-3xl p-8 border border-white/10"
                    >
                        <h2 className="text-2xl font-display font-bold mb-6 text-luxury-gold">Popular Products</h2>
                        <div className="space-y-4">
                            {analytics.popularProducts.map((product, index) => (
                                <div key={index} className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-white">{product.name}</span>
                                        <span className="text-sm text-luxury-gold font-bold">{product.sales} sales</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Views:</span>
                                            <span className="text-white font-medium ml-2">{product.views}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Try-Ons:</span>
                                            <span className="text-white font-medium ml-2">{product.tryOns}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-luxury rounded-3xl p-8 border border-white/10"
                    >
                        <h2 className="text-2xl font-display font-bold mb-6 text-luxury-gold">Sales by Category</h2>
                        <div className="space-y-6">
                            {analytics.categoryBreakdown.map((cat, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-white">{cat.category}</span>
                                        <span className="text-sm text-gray-400">{cat.sales} sales ({cat.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-luxury-gold to-yellow-600 rounded-full transition-all duration-500"
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-luxury rounded-3xl p-8 border border-white/10"
                >
                    <h2 className="text-2xl font-display font-bold mb-6 text-luxury-gold">Recent Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/40 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Revenue</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Orders</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Try-Ons</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.recentMetrics.map((metric, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-white font-medium">{metric.date}</td>
                                        <td className="px-6 py-4 text-sm text-luxury-gold font-bold">${metric.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-white">{metric.orders}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{metric.tryOns}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function MetricCard({ title, value, change, positive, icon, color }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-luxury rounded-2xl p-6 border border-white/10 hover:border-luxury-gold/30 transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <span className={`text-sm font-bold ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {change}
                </span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </motion.div>
    );
}
