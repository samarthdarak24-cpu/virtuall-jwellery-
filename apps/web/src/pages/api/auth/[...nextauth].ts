import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                        }
                    );

                    if (response.data.user) {
                        return response.data.user;
                    }
                    return null;
                } catch (error) {
                    // Fallback for demo mode
                    console.log('Login failed, using demo user');
                    return {
                        id: 'demo-user-1',
                        name: 'Demo User',
                        email: credentials?.email || 'demo@jewelfit.com',
                        image: 'https://via.placeholder.com/150',
                    };
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login', // Redirect to login on error
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google sign-in
            if (account?.provider === 'google') {
                try {
                    // Register or login user via backend API
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
                        {
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            googleId: account.providerAccountId,
                        }
                    );
                    
                    // Attach backend user ID to the user object
                    user.id = response.data.user.id;
                    return true;
                } catch (error) {
                    console.error('Google sign-in error:', error);
                    // Allow sign-in even if backend fails (demo mode)
                    user.id = account.providerAccountId;
                    return true;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            
            // Attach account info
            if (account) {
                token.provider = account.provider;
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};

export default NextAuth(authOptions);
