import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<string>('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.email === 'demo@jewelfit.test') {
            loadDashboardData();
        }
    }, [session]);

    const loadDashboardData = async () => {
        setLoading(true);
        setNotification('Refreshing dashboard data...');
        
        try {
            const productsRes = await axios.get('/api/products');
            const products = productsRes.data || [];
            const totalProducts = products.length;
            const totalRevenue = products.reduce((sum: number, product: any) => sum + (parseFloat(product.price) || 0), 0);

            setStats({
                totalProducts,
                totalUsers: 15,
                totalOrders: 42,
                revenue: Math.round(totalRevenue * 10),
            });

            const recentActivity = [];
            if (products.length > 0) {
                recentActivity.push({
                    id: 1,
                    type: 'product',
                    action: `New product added: ${products[products.length - 1]?.name || 'Product'}`,
                    time: '2 hours ago',
                    icon: '💎'
                });
            }
            recentActivity.push(
                { id: 2, type: 'order', action: 'Order #1234 completed', time: '5 hours ago', icon: '✅' },
                { id: 3, type: 'user', action: 'New user registered', time: '1 day ago', icon: '👤' }
            );
            if (products.length > 1) {
                recentActivity.push({
                    id: 4,
                    type: 'product',
                    action: `Product updated: ${products[0]?.name || 'Product'}`,
                    time: '2 days ago',
                    icon: '✏️'
                });
            }

            setRecentActivity(recentActivity);
            setNotification('✅ Dashboard updated successfully!');
            setTimeout(() => setNotification(''), 3000);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setStats({ totalProducts: 0, totalUsers: 15, totalOrders: 42, revenue: 125000 });
            setRecentActivity([
                { id: 1, type: 'product', action: 'New product added', time: '2 hours ago', icon: '💎' },
                { id: 2, type: 'order', action: 'Order #1234 completed', time: '5 hours ago', icon: '✅' },
                { id: 3, type: 'user', action: 'New user registered', time: '1 day ago', icon: '👤' },
                { id: 4, type: 'product', action: 'Product updated', time: '2 days ago', icon: '✏️' },
            ]);
            setNotification('⚠️ Failed to load some data');
            setTimeout(() => setNotification(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full mx-auto mb-4"
                    />
                    <p className="text-yellow-700 font-medium">Loading dashboard...</p>
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
                {[...Array(30)].map((_, i) => (
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
                {/* Gold Glow Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-yellow-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>

            <Navbar />

            <main className="relative pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="fixed top-24 right-4 z-50 bg-gradient-to-r from-yellow-500 to-amber-500 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl shadow-yellow-500/50 border border-yellow-400"
                        >
                            <p className="text-white font-bold flex items-center gap-2">
                                <motion.span 
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-xl"
                                >
                                    ✨
                                </motion.span>
                                {notification}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl font-display font-bold mb-2 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm"
                            >
                                Admin Dashboard
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-600 text-lg font-medium"
                            >
                                Manage your luxury jewelry collection
                            </motion.p>
                        </div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(234, 179, 8, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadDashboardData}
                            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all flex items-center gap-2 hover:shadow-xl"
                        >
                            <motion.svg 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </motion.svg>
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Products" value={stats.totalProducts} icon="💎" delay={0} />
                    <StatCard title="Total Users" value={stats.totalUsers} icon="👥" delay={0.1} />
                    <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" delay={0.2} />
                    <StatCard title="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon="💰" delay={0.3} />
                </div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
                    <h2 className="text-3xl font-display font-bold mb-6 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ActionCard title="Upload Product" description="Add new jewelry to your collection" icon="📤" href="/admin/upload" />
                        <ActionCard title="Manage Products" description="Edit, delete, or update existing products" icon="✏️" href="/admin/products" />
                        <ActionCard title="View Orders" description="Monitor and manage customer orders" icon="📋" href="/admin/orders" />
                        <ActionCard title="User Management" description="View and manage user accounts" icon="👤" href="/admin/users" />
                        <ActionCard title="Analytics" description="View detailed platform analytics" icon="📊" href="/admin/analytics" />
                        <ActionCard title="Settings" description="Configure platform settings" icon="⚙️" href="/admin/settings" />
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                            Recent Activity
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setNotification('📊 Viewing all activity...'); setTimeout(() => setNotification(''), 2000); }}
                            className="text-sm text-gray-600 hover:text-yellow-600 transition-colors font-medium flex items-center gap-1"
                        >
                            View All
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-yellow-200 shadow-2xl shadow-yellow-500/10">
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5, boxShadow: "0 8px 30px rgba(234, 179, 8, 0.2)" }}
                                    onClick={() => { setNotification(`Opening ${activity.type} details...`); setTimeout(() => setNotification(''), 2000); }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer group"
                                >
                                    <motion.div 
                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30"
                                    >
                                        {activity.icon}
                                    </motion.div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-semibold group-hover:text-yellow-700 transition-colors">{activity.action}</p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        activity.type === 'product' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                        activity.type === 'order' ? 'bg-green-100 text-green-700 border-green-300' :
                                        'bg-blue-100 text-blue-700 border-blue-300'
                                    }`}>
                                        {activity.type}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 50px rgba(234, 179, 8, 0.3)"
            }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer shadow-xl shadow-yellow-500/10 relative overflow-hidden group"
        >
            {/* Shine Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
            />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <motion.div 
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/40"
                    >
                        {icon}
                    </motion.div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1 font-semibold uppercase tracking-wide">{title}</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">{value}</p>
                <div className="text-xs text-yellow-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                </div>
            </div>
        </motion.div>
    );
}

function ActionCard({ title, description, icon, href }: any) {
    const router = useRouter();
    
    return (
        <motion.div
            whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 50px rgba(234, 179, 8, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(href)}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer group shadow-xl shadow-yellow-500/10 relative overflow-hidden"
        >
            {/* Shine Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6 }}
            />
            
            <div className="relative z-10">
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl mb-4"
                >
                    {icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <div className="flex items-center text-yellow-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <motion.svg 
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 ml-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                </div>
            </div>
        </motion.div>
    );
}
