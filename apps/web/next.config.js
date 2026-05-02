/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@jewelfit/types'],
    images: {
        domains: ['localhost', 'jewelfit-assets.s3.amazonaws.com', 'images.unsplash.com'],
    },
    webpack: (config) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });
        return config;
    },
};

module.exports = nextConfig;
