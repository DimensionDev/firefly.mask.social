'use server';

import { KeyType } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regex.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { once } from '@/helpers/once.js';
import { OpenGraphProcessor } from '@/libs/og/Processor.js';

export const digestOpenGraphLink = memoizeWithRedis(OpenGraphProcessor.digestDocumentUrl, {
    key: KeyType.DigestOpenGraphLink,
    resolver: (link) => link,
});

export const refreshOpenGraphLink = once(async (form: FormData) => {
    const url = form.get('url');
    if (!url || typeof url !== 'string') throw new Error('Invalid URL.');

    URL_REGEX.lastIndex = 0;
    if (!URL_REGEX.test(url)) throw new Error('Invalid URL.');

    await digestOpenGraphLink.cache.delete(url);
});
