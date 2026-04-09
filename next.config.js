/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: {
        // Deploy even if there are type errors (we handle them locally)
        ignoreBuildErrors: true,
    },
    eslint: {
        // Deploy even if there are lint warnings
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
    },
};

module.exports = nextConfig;
