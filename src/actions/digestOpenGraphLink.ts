'use server';

import { KeyType } from '@/constants/enum.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { once } from '@/helpers/once.js';
import { OpenGraphProcessor } from '@/libs/og/Processor.js';

export const digestOpenGraphLink = memoizeWithRedis(OpenGraphProcessor.digestDocumentUrl, {
    key: KeyType.DigestOpenGraphLink,
    resolver: (link) => link,
});

export const refreshOpenGraphLink = once(async (link) => {
    await digestOpenGraphLink.cache.delete(link);
});
