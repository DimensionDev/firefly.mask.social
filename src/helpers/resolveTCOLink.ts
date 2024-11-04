import { fetchText } from '@/helpers/fetchText.js';
import { memoizePromise } from '@/helpers/memoizePromise.js';

const cache = new Map<string, string>();

export function isTCOLink(u: string) {
    return u.startsWith('https://t.co/');
}

async function resolver(u: string): Promise<string | null> {
    if (!isTCOLink(u)) return null;
    if (cache.has(u)) return cache.get(u)!;
    const text = await fetchText(u, {
        redirect: 'error',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    });
    const url = text.match(/URL=(.+).><\/noscript/)?.[1];
    if (url) cache.set(u, url);
    return url ?? null;
}

/** Resolve a https://t.co/ link to it's real address. */
export const resolveTCOLink = memoizePromise(resolver, (x) => x);
