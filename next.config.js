/* cspell:disable */

import { execSync } from 'child_process';
import CopyPlugin from 'copy-webpack-plugin';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { POLICY_SETTINGS } from './csp.js';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(dirname(import.meta.url));
const outputPath = fileURLToPath(new URL('./public', import.meta.url));
const polyfillsFolderPath = join(outputPath, './js/polyfills');

/** @type {import('next').NextConfig} */
export default {
    productionBrowserSourceMaps: false,

    // Note: we run tsc and eslint in other places
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        esmExternals: true,
        scrollRestoration: true,
        serverSourceMaps: false,
        swcPlugins: [['@lingui/swc-plugin', {}]],
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
    images: {
        dangerouslyAllowSVG: false,
        unoptimized: process.env.NODE_ENV === 'development' ? true : false,
        remotePatterns: [
            {
                hostname: 'images.unsplash.com',
            },
            {
                hostname: 'tailwindui.com',
            },
            {
                hostname: 'pbs.twimg.com',
            },
            {
                hostname: 'static-assets.hey.xyz',
            },
            {
                hostname: 'gw.ipfs-lens.dev',
            },
            {
                hostname: 'cdn.stamp.fyi',
            },
            {
                hostname: 'i.imgur.com',
            },
            {
                hostname: 'ik.imagekit.io',
            },
            {
                hostname: '*.mask.social',
            },
            { protocol: 'https', hostname: 'pbs.twimg.com' },
            { protocol: 'https', hostname: 'abs.twimg.com' },
            {
                hostname: '*.giphy.com',
            },
            {
                hostname: 'static.debank.com',
            },
            {
                protocol: 'https',
                hostname: 'ipfs.io',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)?', // Matches all pages
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff', // Prevent MIME type sniffing
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block', // Prevent rendering
                    },
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: POLICY_SETTINGS,
                    },
                ],
            },
            {
                source: '/next-debug.log',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ];
    },
    webpack: (config, context) => {
        if (!config.plugins) config.plugins = [];
        if (!config.module.rules) config.module.rules = [];

        config.plugins.push(
            ...[
                new context.webpack.IgnorePlugin({
                    resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
                }),
                new context.webpack.DefinePlugin({
                    'process.env.WEB3_CONSTANTS_RPC': JSON.stringify(process.env.WEB3_CONSTANTS_RPC ?? ''),
                    'process.env.MASK_SENTRY_DSN': JSON.stringify(process.env.MASK_SENTRY_DSN ?? ''),
                    'process.env.MASK_SENTRY': JSON.stringify('disabled'),
                    'process.env.MASK_MIXPANEL': JSON.stringify('disabled'),
                    'process.env.COMMIT_HASH': JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
                    'process.env.NODE_DEBUG': 'undefined',
                    'process.version': JSON.stringify(process.env.npm_package_version),
                }),
                new CopyPlugin({
                    patterns: [
                        {
                            context: join(__dirname, './src/maskbook/packages/polyfills/dist/'),
                            from: '*.js',
                            to: polyfillsFolderPath,
                        },
                    ],
                }),
            ],
        );

        config.optimization = {
            ...config.optimization,
            usedExports: false,
        };

        config.experiments = {
            ...config.experiments,
            backCompat: false,
            asyncWebAssembly: true,
        };

        config.externals = [...(config.externals ?? []), '@napi-rs/image', 'canvas'];

        config.resolve.extensionAlias = {
            ...config.resolve.extensionAlias,
            '.js': ['.js', '.ts', '.tsx'],
            '.mjs': ['.mts', '.mjs'],
        };
        config.resolve.extensions = ['.js', '.ts', '.tsx'];
        config.resolve.conditionNames = ['mask-src', '...'];
        config.resolve.fallback = {
            ...config.resolve.fallback,
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
            zlib: require.resolve('zlib-browserify'),
            'text-encoding': require.resolve('@sinonjs/text-encoding'),
        };

        config.module.rules.push(
            {
                test: /\.svg$/i,
                exclude: /src\/maskbook/,
                loader: '@svgr/webpack',
                options: {
                    svgoConfig: {
                        plugins: [
                            {
                                name: 'preset-default',
                                params: {
                                    overrides: {
                                        // disable plugins
                                        removeViewBox: false,
                                    },
                                },
                            },
                            'prefixIds',
                        ],
                    },
                },
            },
            {
                test: /\.svg$/i,
                include: /src\/maskbook/,
                loader: require.resolve('svgo-loader'),
                options: {
                    js2svg: {
                        pretty: false,
                    },
                },
                dependency(data) {
                    if (data === '') return false;
                    return true;
                },
                type: 'asset/resource',
            },
        );

        return config;
    },
};
