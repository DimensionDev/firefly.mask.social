/* cspell:disable */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import CopyPlugin from 'copy-webpack-plugin';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(dirname(import.meta.url));
const outputPath = fileURLToPath(new URL('./public', import.meta.url));
const polyfillsFolderPath = join(outputPath, './js/polyfills');

/** @type {import('next').NextConfig} */
export default {
    experimental: {
        esmExternals: true,
        scrollRestoration: true,
        swcPlugins: [['@lingui/swc-plugin', {}]],
    },
    images: {
        dangerouslyAllowSVG: false,
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
                    'process.env.WEB3_CONSTANTS_RPC': process.env.WEB3_CONSTANTS_RPC ?? '{}',
                    'process.env.MASK_SENTRY_DSN': process.env.MASK_SENTRY_DSN ?? '{}',
                    'process.env.NODE_DEBUG': 'undefined',
                    'process.version': JSON.stringify('0.1.0'),
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

        config.module.rules.push({
            test: /\.svg$/i,
            exclude: /src\/maskbook/,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
};
