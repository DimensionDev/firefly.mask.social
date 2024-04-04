'use server';

import { KeyType } from '@/constants/enum.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { once } from '@/helpers/once.js';
import { FrameProcessor } from '@/libs/frame/Processor.js';

export const digestFrameLink = memoizeWithRedis(FrameProcessor.digestDocumentUrl, {
    key: KeyType.DigestFrameLink,
    resolver: (link) => link,
});

export const refreshFrameLink = once(async (link) => {
    await digestFrameLink.cache.delete(link);
});
