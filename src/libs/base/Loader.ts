import { compact, uniqBy } from 'lodash-es';

import { URL_REGEX } from '@/constants/regex.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';

export abstract class BaseLoader<T> {
    protected ab: AbortController | null = null;
    protected map = new Map<string, Promise<T | null>>();

    protected abstract fetch(url: string): Promise<T | null>;

    protected fetchCached(url: string): Promise<T | null> {
        if (!this.map?.has(url)) {
            const p = this.fetch(url);
            this.map.set(url, p);
            p.catch(() => this.map.delete(url));
        }
        return this.map.get(url)!;
    }

    /**
     * Load the items from urls in given content.
     * @param content
     * @returns
     */
    async load(content: string): Promise<T[]> {
        if (!content) return [];

        URL_REGEX.lastIndex = 0;

        const urls = uniqBy(
            [...content.matchAll(URL_REGEX)].map((x) => fixUrlProtocol(x[0])),
            (x) => x.toLowerCase(),
        );
        if (!urls.length) return [];

        const allSettled = await Promise.allSettled(urls.map((x) => this.fetchCached(x)));
        return compact(allSettled.map((x) => (x.status === 'fulfilled' && x.value ? x.value : null)));
    }

    /**
     * Abort all ongoing requests and load the items.
     * @param content
     * @returns
     */
    async occupancyLoad(content: string): Promise<T[]> {
        if (this.ab) this.ab.abort();
        this.ab = new AbortController();

        const ab = this.ab;
        const items = await this.load(content);

        if (ab.signal.aborted) throw new Error('Aborted');
        return items;
    }
}
