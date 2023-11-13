/* cspell:disable */

/** @type {import('next').NextConfig} */
export default {
    images: {
        dangerouslyAllowSVG: true,
        domains: ['images.unsplash.com', 'tailwindui.com', 'pbs.twimg.com'],
    },
    webpack: (config, context) => {
        if (config.plugins) {
            config.plugins.push(
                new context.webpack.IgnorePlugin({
                    resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
                }),
            );
        }

        config.resolve.extensionAlias = {
            '.js': ['.js', '.ts', '.tsx'],
            '.mjs': ['.mts', '.mjs'],
        };

        return config;
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
};
