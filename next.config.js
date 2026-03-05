/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        // Для Remotion — исключаем серверные модули из бандла
        config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
    },
};

module.exports = nextConfig;
