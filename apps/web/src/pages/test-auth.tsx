import { useSession, signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TestAuth() {
    const { data: session, status } = useSession();

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                className="card max-w-2xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold mb-6 text-gradient">
                    Authentication Test
                </h1>

                <div className="space-y-6">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Status</h2>
                        <p className="text-gray-300">
                            {status === 'loading' && 'Loading...'}
                            {status === 'authenticated' && '✅ Authenticated'}
                            {status === 'unauthenticated' && '❌ Not authenticated'}
                        </p>
                    </div>

                    {session && (
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">User Info</h2>
                            <div className="space-y-2 text-gray-300">
                                <p><strong>ID:</strong> {session.user?.id}</p>
                                <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {session.user?.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {!session ? (
                            <>
                                <Link href="/auth/login" className="btn-primary flex-1 text-center">
                                    Go to Login
                                </Link>
                                <Link href="/auth/register" className="btn-secondary flex-1 text-center">
                                    Go to Register
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => signOut()}
                                className="btn-primary w-full"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Demo Credentials</h3>
                        <p className="text-sm text-gray-300">
                            <strong>Email:</strong> demo@jewelfit.test<br />
                            <strong>Password:</strong> Demo123!
                        </p>
                    </div>

                    <Link href="/" className="block text-center text-primary-400 hover:text-primary-300">
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
