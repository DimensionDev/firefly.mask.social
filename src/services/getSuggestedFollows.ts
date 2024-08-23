import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export async function getSuggestedFollows(source: SocialSource, indicator?: PageIndicator, retry = 3) {
    if (source === Source.Twitter) return createPageable<Profile>(EMPTY_LIST, createIndicator(undefined));
    const provider = resolveSocialMediaProvider(source);
    const results = await provider.getSuggestedFollows(indicator);
    if (!results.data?.length && results.nextIndicator && retry) {
        return getSuggestedFollows(source, results.nextIndicator as PageIndicator, retry - 1);
    }

    return results;
}
