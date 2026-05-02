import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrders() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/admin/orders');
        } else if (status === 'authenticated' && session?.user?.email !== 'demo@jewelfit.test') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.email === 'demo@jewelfit.test') {
            loadOrders();
        }
    }, [session]);

    const loadOrders = async () => {
        // Mock data - replace with actual API call
        const mockOrders = [
            {
                id: 1,
                orderNumber: 'ORD-2026-001',
                customer: 'John Doe',
                email: 'john@example.com',
                items: [
                    { name: 'Gold Necklace', quantity: 1, price: 2499 },
                    { name: 'Diamond Earrings', quantity: 2, price: 1299 }
                ],
                total: 5097,
                status: 'pending',
                date: '2026-05-01',
                shippingAddress: '123 Main St, New York, NY 10001'
            },
            {
                id: 2,
                orderNumber: 'ORD-2026-002',
                customer: 'Jane Smith',
                email: 'jane@example.com',
                items: [
                    { name: 'Platinum Ring', quantity: 1, price: 3999 }
                ],
                total: 3999,
                status: 'processing',
                date: '2026-05-02',
                shippingAddress: '456 Oak Ave, Los Angeles, CA 90001'
            },
            {
                id: 3,
                orderNumber: 'ORD-2026-003',
                customer: 'Bob Johnson',
                email: 'bob@example.com',
                items: [
                    { name: 'Silver Bracelet', quantity: 1, price: 899 }
                ],
                total: 899,
                status: 'shipped',
                date: '2026-04-30',
                shippingAddress: '789 Pine Rd, Chicago, IL 60601'
            },
            {
                id: 4,
                orderNumber: 'ORD-2026-004',
                customer: 'Alice Williams',
                email: 'alice@example.com',
                items: [
                    { name: 'Rose Gold Necklace', quantity: 1, price: 2199 }
                ],
                total: 2199,
                status: 'delivered',
                date: '2026-04-28',
                shippingAddress: '321 Elm St, Houston, TX 77001'
            }
        ];

        setOrders(mockOrders);
        setLoading(false);
    };

    const updateOrderStatus = (orderId: number, newStatus: string) => {
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        setSelectedOrder(null);
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(order => order.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading orders...</p>
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
                    <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">Order Management</h1>
                    <p className="text-gray-600 font-medium">Monitor and manage customer orders</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border-2 border-yellow-200 shadow-lg">
                        <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Orders</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border-2 border-yellow-300 shadow-lg">
                        <div className="text-2xl font-bold text-yellow-700">{orders.filter(o => o.status === 'pending').length}</div>
                        <div className="text-sm text-gray-600 font-medium">Pending</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                        <div className="text-2xl font-bold text-blue-700">{orders.filter(o => o.status === 'processing').length}</div>
                        <div className="text-sm text-gray-600 font-medium">Processing</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border-2 border-purple-200 shadow-lg">
                        <div className="text-2xl font-bold text-purple-700">{orders.filter(o => o.status === 'shipped').length}</div>
                        <div className="text-sm text-gray-600 font-medium">Shipped</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border-2 border-green-200 shadow-lg">
                        <div className="text-2xl font-bold text-green-700">{orders.filter(o => o.status === 'delivered').length}</div>
                        <div className="text-sm text-gray-600 font-medium">Delivered</div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 mb-8 border-2 border-yellow-200 shadow-lg">
                    <label className="block text-sm text-gray-700 mb-2 font-semibold">Filter by Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-64 bg-amber-50/50 border-2 border-yellow-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-colors"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-yellow-200 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order #</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-yellow-100 hover:bg-yellow-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-yellow-700 font-bold">{order.orderNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                            <div className="text-xs text-gray-600">{order.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-all text-sm font-bold"
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

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No orders found</h3>
                        <p className="text-gray-500">Try adjusting your filters</p>
                    </div>
                )}
            </main>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-neutral-900 rounded-3xl p-8 max-w-3xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-gradient">Order Details</h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Order Number</div>
                                    <div className="text-lg font-mono text-luxury-gold">{selectedOrder.orderNumber}</div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                                    <div className="text-sm text-gray-400 mb-1">Order Date</div>
                                    <div className="text-lg font-medium text-white">{selectedOrder.date}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-black/40 rounded-xl p-6 border border-white/10 mb-6">
                                <h3 className="text-lg font-bold text-luxury-gold mb-4">Customer Information</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name:</span>
                                        <span className="text-white font-medium">{selectedOrder.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Email:</span>
                                        <span className="text-white font-medium">{selectedOrder.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Shipping Address:</span>
                                        <span className="text-white font-medium text-right">{selectedOrder.shippingAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-black/40 rounded-xl p-6 border border-white/10 mb-6">
                                <h3 className="text-lg font-bold text-luxury-gold mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                            <div>
                                                <div className="text-white font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-400">Quantity: {item.quantity}</div>
                                            </div>
                                            <div className="text-white font-bold">${item.price.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                                    <span className="text-lg font-bold text-gray-400">Total:</span>
                                    <span className="text-2xl font-bold text-luxury-gold">${selectedOrder.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Update Status */}
                            <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-luxury-gold mb-4">Update Order Status</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                            className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                                                selectedOrder.status === status
                                                    ? getStatusColor(status)
                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            {status.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
