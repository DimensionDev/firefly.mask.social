import { parseURL } from '@/helpers/parseURL.js';
import type { ShortLink } from '@/providers/types/ShortLink.js';

export class TwitterShortLink implements ShortLink {
    async resolve() {
        throw new Error('Method not implemented.');
    }

    async lookup(url: string | URL): Promise<string> {
        throw new Error('Method not implemented.');
    }

    static is(url: string | URL): boolean {
        const u = typeof url === 'string' ? parseURL(url) : url;
        return !!u && u.hostname === 't.co';
    }
}

export const TwitterShortLinkProvider = new TwitterShortLink();
