import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { URL_REGEX } from '@/constants/regex.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';
import type { Frame, LinkDigested } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

class Loader {
    private ab: AbortController | null = null;
    private map = new Map<string, Promise<Frame | null>>();

    private fetchFrame = (url: string) => {
        return new Promise<Frame | null>((resolve) => {
            requestIdleCallback(async () => {
                const response = await fetchCachedJSON<ResponseJSON<LinkDigested>>(urlcat('/api/frame', { link: url }));
                if (response.success) resolve(response.data.frame);
                else resolve(null);
            });
        });
    };

    private fetchFrameCached = async (url: string) => {
        if (!this.map?.has(url)) {
            const p = this.fetchFrame(url);
            this.map.set(url, p);
            p.catch(() => this.map.delete(url));
        }
        return this.map.get(url)!;
    };

    /**
     * Load the frames from urls in given content.
     * @param content
     * @returns
     */
    async load(content: string): Promise<Frame[]> {
        const urls = [...content.matchAll(URL_REGEX)].map((x) => fixUrlProtocol(x[0]));
        const allSettled = await Promise.allSettled(urls.map((x) => this.fetchFrameCached(x)));
        return compact(allSettled.map((x) => (x.status === 'fulfilled' && x.value ? x.value : null)));
    }

    /**
     * Abort all ongoing requests and load the frames.
     * @param content
     * @returns
     */
    async occupancyLoad(content: string): Promise<Frame[]> {
        if (this.ab) this.ab.abort();
        this.ab = new AbortController();

        const ab = this.ab;
        const frames = await this.load(content);

        if (ab.signal.aborted) throw new Error('Aborted');
        return frames;
    }
}

export const FrameLoader = new Loader();
