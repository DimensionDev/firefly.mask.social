import { parse } from 'twemoji-parser';

import { fetchText } from '@/helpers/fetchText.js';

export async function loadTwmojiUrls(content: string) {
    const entities = parse(content);
    const allSettled = await Promise.allSettled(
        entities.map(async (emoji) => {
            if (emoji.type !== 'emoji' || !emoji.url) return [];

            const text = await fetchText(emoji.url, {
                cache: 'force-cache',
            });
            if (!text) return [];

            return [emoji.text, `data:image/svg+xml;base64,${btoa(text)}`];
        }),
    );
    return Object.fromEntries(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : [])));
}
