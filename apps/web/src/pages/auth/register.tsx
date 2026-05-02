import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import axios from 'axios';

// Password strength checker
const checkPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) strength++;
    if (checks.uppercase) strength++;
    if (checks.lowercase) strength++;
    if (checks.number) strength++;
    if (checks.special) strength++;

    let level: 'weak' | 'medium' | 'strong' = 'weak';
    if (strength >= 4) level = 'strong';
    else if (strength >= 3) level = 'medium';

    return { strength, level, checks };
};

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordStrength = useMemo(() => checkPasswordStrength(formData.password), [formData.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!passwordStrength.checks.uppercase) {
            setError('Password must contain at least one uppercase letter');
            return;
        }

        if (!passwordStrength.checks.lowercase) {
            setError('Password must contain at least one lowercase letter');
            return;
        }

        if (!passwordStrength.checks.number) {
            setError('Password must contain at least one number');
            return;
        }

        if (!passwordStrength.checks.special) {
            setError('Password must contain at least one special character (!@#$%^&*...)');
            return;
        }

        if (passwordStrength.level === 'weak') {
            setError('Password is too weak. Please use a stronger password.');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            router.push('/auth/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <motion.div
                className="w-full max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Main Card with Square Box Design */}
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-500/30 p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                            Create Account
                        </h1>
                        <p className="text-xl text-gray-300">Join JewelFit and start your journey</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border-2 border-red-500 text-red-200 px-6 py-4 rounded-xl mb-6 text-lg font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-lg font-semibold mb-3 text-white">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 text-lg bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-lg font-semibold mb-3 text-white">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 text-lg bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-lg font-semibold mb-3 text-white">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-6 py-4 pr-14 text-lg bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-4 p-5 bg-slate-700/30 border-2 border-slate-600 rounded-xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${
                                                passwordStrength.level === 'weak' ? 'bg-red-500' :
                                                passwordStrength.level === 'medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <span className={`text-base font-bold min-w-[80px] ${
                                        passwordStrength.level === 'weak' ? 'text-red-400' :
                                        passwordStrength.level === 'medium' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>
                                        {passwordStrength.level === 'weak' ? '🔴 Weak' :
                                         passwordStrength.level === 'medium' ? '🟡 Medium' :
                                         '🟢 Strong'}
                                    </span>
                                </div>

                                {/* Password Requirements */}
                                <div className="space-y-2 text-base">
                                    <div className={`flex items-center gap-3 ${passwordStrength.checks.length ? 'text-green-400' : 'text-gray-400'}`}>
                                        <span className="text-xl font-bold">{passwordStrength.checks.length ? '✓' : '○'}</span>
                                        <span className="font-medium">At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-3 ${passwordStrength.checks.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                                        <span className="text-xl font-bold">{passwordStrength.checks.uppercase ? '✓' : '○'}</span>
                                        <span className="font-medium">One uppercase letter (A-Z)</span>
                                    </div>
                                    <div className={`flex items-center gap-3 ${passwordStrength.checks.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                                        <span className="text-xl font-bold">{passwordStrength.checks.lowercase ? '✓' : '○'}</span>
                                        <span className="font-medium">One lowercase letter (a-z)</span>
                                    </div>
                                    <div className={`flex items-center gap-3 ${passwordStrength.checks.number ? 'text-green-400' : 'text-gray-400'}`}>
                                        <span className="text-xl font-bold">{passwordStrength.checks.number ? '✓' : '○'}</span>
                                        <span className="font-medium">One number (0-9)</span>
                                    </div>
                                    <div className={`flex items-center gap-3 ${passwordStrength.checks.special ? 'text-green-400' : 'text-gray-400'}`}>
                                        <span className="text-xl font-bold">{passwordStrength.checks.special ? '✓' : '○'}</span>
                                        <span className="font-medium">One special character (!@#$%...)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-3 text-white">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-6 py-4 pr-14 text-lg bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="mt-3 text-base text-red-400 font-medium flex items-center gap-2">
                                <span className="text-xl">✗</span> Passwords do not match
                            </p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="mt-3 text-base text-green-400 font-medium flex items-center gap-2">
                                <span className="text-xl">✓</span> Passwords match
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || passwordStrength.level === 'weak'}
                        className="w-full py-5 text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 rounded-xl hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-[1.02]"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Sign In Link */}
                <p className="mt-8 text-center text-lg text-gray-300">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300 font-semibold underline">
                        Sign in
                    </Link>
                </p>
                </div>
            </motion.div>
        </div>
    );
}
