import { compact } from 'lodash-es';

export abstract class BaseLoader<T> {
    protected ab: AbortController | null = null;
    protected map = new Map<string, Promise<T | null>>();

    protected abstract fetch(url: string, signal?: AbortSignal): Promise<T | null>;

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
        urls: string[],
        signal?: AbortSignal,
    ): Promise<
        Array<{
            value: T;
            url: string;
        }>
    > {
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
    async occupancyLoad(urls: string[]): Promise<
        Array<{
            value: T;
            url: string;
        }>
    > {
        this.ab?.abort();
        this.ab = new AbortController();
        return this.load(urls, this.ab.signal);
    }
}
