'use server';

import { KeyType } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regex.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { once } from '@/helpers/once.js';
import { FrameProcessor } from '@/libs/frame/Processor.js';

export const digestFrameLink = memoizeWithRedis(FrameProcessor.digestDocumentUrl, {
    key: KeyType.DigestFrameLink,
    resolver: (link) => link,
});

export const refreshFrameLink = once(async (form: FormData) => {
    const url = form.get('url');
    if (!url || typeof url !== 'string') throw new Error('Invalid URL.');

    URL_REGEX.lastIndex = 0;
    if (!URL_REGEX.test(url)) throw new Error('Invalid URL.');

    await digestFrameLink.cache.delete(url);
});
