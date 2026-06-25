/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@jewelfit/types'],
    images: {
        domains: ['localhost', 'jewelfit-assets.s3.amazonaws.com', 'images.unsplash.com'],
    },
    webpack: (config, { isServer }) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });

        // Fix for onnxruntime-web
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        // Handle .wasm files
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        return config;
    },
};

module.exports = nextConfig;
