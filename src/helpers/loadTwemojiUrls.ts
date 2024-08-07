import { parse } from 'twemoji-parser';

import { fetchText } from '@/helpers/fetchText.js';

function fixMaxCDN(url: string) {
    return url.replace(
        'https://twemoji.maxcdn.com/v/latest/svg/',
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/',
    );
}

export async function loadTwemojiUrls(content: string) {
    const allSettled = await Promise.allSettled(
        parse(content).map(async (emoji) => {
            if (emoji.type !== 'emoji' || !emoji.url) return [];

            const text = await fetchText(fixMaxCDN(emoji.url), {
                cache: 'force-cache',
            });
            if (!text) return [];

            return [emoji.text, `data:image/svg+xml;base64,${btoa(text)}`];
        }),
    );
    return Object.fromEntries(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : [])));
}
