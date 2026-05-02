import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AdminUsers() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin/users');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.email === 'demo@jewelfit.test') {
            loadUsers();
        }
    }, [session]);

    const loadUsers = async () => {
        // Mock data - replace with actual API call
        const mockUsers = [
            {
                id: 1,
                name: 'Demo User',
                email: 'demo@jewelfit.test',
                role: 'admin',
                joinDate: '2026-01-01',
                lastActive: '2026-05-02',
                orders: 0,
                totalSpent: 0,
                status: 'active'
            },
            {
                id: 2,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'customer',
                joinDate: '2026-03-15',
                lastActive: '2026-05-01',
                orders: 5,
                totalSpent: 12495,
                status: 'active'
            },
            {
                id: 3,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'customer',
                joinDate: '2026-02-20',
                lastActive: '2026-04-30',
                orders: 3,
                totalSpent: 8997,
                status: 'active'
            },
            {
                id: 4,
                name: 'Bob Johnson',
                email: 'bob@example.com',
                role: 'customer',
                joinDate: '2026-04-10',
                lastActive: '2026-04-28',
                orders: 2,
                totalSpent: 5998,
                status: 'active'
            },
            {
                id: 5,
                name: 'Alice Williams',
                email: 'alice@example.com',
                role: 'customer',
                joinDate: '2026-01-25',
                lastActive: '2026-03-15',
                orders: 1,
                totalSpent: 2199,
                status: 'inactive'
            }
        ];

        setUsers(mockUsers);
        setLoading(false);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading users...</p>
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
                    <h1 className="text-4xl font-display font-bold text-gradient mb-2">User Management</h1>
                    <p className="text-gray-400">View and manage user accounts</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-luxury rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">{users.length}</div>
                        <div className="text-sm text-gray-400">Total Users</div>
                    </div>
                    <div className="glass-luxury rounded-xl p-4 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</div>
                        <div className="text-sm text-gray-400">Active</div>
                    </div>
                    <div className="glass-luxury rounded-xl p-4 border border-yellow-500/20">
                        <div className="text-2xl font-bold text-yellow-400">{users.filter(u => u.role === 'admin').length}</div>
                        <div className="text-sm text-gray-400">Admins</div>
                    </div>
                    <div className="glass-luxury rounded-xl p-4 border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">{users.filter(u => u.orders > 0).length}</div>
                        <div className="text-sm text-gray-400">Customers</div>
                    </div>
                </div>

                {/* Search */}
                <div className="glass-luxury rounded-2xl p-6 mb-8 border border-white/10">
                    <label className="block text-sm text-gray-400 mb-2">Search Users</label>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-luxury-gold outline-none transition-colors"
                    />
                </div>

                {/* Users Table */}
                <div className="glass-luxury rounded-2xl overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/40 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Join Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Orders</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-champagne flex items-center justify-center text-black font-bold">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.role === 'admin'
                                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{user.joinDate}</td>
                                        <td className="px-6 py-4 text-sm text-white font-medium">{user.orders}</td>
                                        <td className="px-6 py-4 text-sm text-luxury-gold font-bold">${user.totalSpent.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            }`}>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="px-4 py-2 bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/30 transition-all text-sm font-bold"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No users found</h3>
                        <p className="text-gray-500">Try adjusting your search</p>
                    </div>
                )}
            </main>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-neutral-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-gradient">User Details</h2>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-champagne flex items-center justify-center text-black font-bold text-3xl">
                                    {selectedUser.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-gray-400">{selectedUser.email}</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Total Orders</div>
                                    <div className="text-2xl font-bold text-white">{selectedUser.orders}</div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Total Spent</div>
                                    <div className="text-2xl font-bold text-luxury-gold">${selectedUser.totalSpent.toLocaleString()}</div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Join Date</div>
                                    <div className="text-lg font-medium text-white">{selectedUser.joinDate}</div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Last Active</div>
                                    <div className="text-lg font-medium text-white">{selectedUser.lastActive}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all font-bold">
                                    View Orders
                                </button>
                                <button className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-bold">
                                    Suspend Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
