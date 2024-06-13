import { NotImplementedError } from '@/constants/error.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { ShortLink } from '@/providers/types/ShortLink.js';

export class TwitterShortLink implements ShortLink {
    async resolve() {
        throw new NotImplementedError();
    }

    async lookup(url: string | URL): Promise<string> {
        throw new NotImplementedError();
    }

    static is(url: string | URL): boolean {
        const u = typeof url === 'string' ? parseURL(url) : url;
        return !!u && u.hostname === 't.co';
    }
}

export const TwitterShortLinkProvider = new TwitterShortLink();
