import { compact, uniqBy } from 'lodash-es';

import { URL_REGEX } from '@/constants/regexp.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';

export abstract class BaseLoader<T> {
    protected ab: AbortController | null = null;
    protected map = new Map<string, Promise<T | null>>();

    protected abstract fetch(url: string, signal?: AbortSignal): Promise<T | null>;

    protected parse(content: string): string[] {
        if (!content) return [];

        URL_REGEX.lastIndex = 0;

        return uniqBy(
            [...content.matchAll(URL_REGEX)].map((x) => fixUrlProtocol(x[0])),
            (x) => x.toLowerCase(),
        );
    }

    protected fetchCached(url: string, signal?: AbortSignal): Promise<T | null> {
        if (!this.map?.has(url)) {
            const p = this.fetch(url, signal);
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
    async load(
        content: string,
        signal?: AbortSignal,
    ): Promise<
        Array<{
            value: T;
            url: string;
        }>
    > {
        const urls = this.parse(content);
        if (!urls.length) return [];

        const allSettled = await Promise.allSettled(urls.map((x) => this.fetchCached(x, signal)));
        return compact(
            allSettled.map((x, i) =>
                x.status === 'fulfilled' && x.value
                    ? {
                          value: x.value,
                          url: urls[i],
                      }
                    : null,
            ),
        );
    }

    /**
     * Abort all ongoing requests and load the items.
     * @param content
     * @returns
     */
    async occupancyLoad(content: string): Promise<
        Array<{
            value: T;
            url: string;
        }>
    > {
        this.ab?.abort();
        this.ab = new AbortController();
        return this.load(content, this.ab.signal);
    }
}
