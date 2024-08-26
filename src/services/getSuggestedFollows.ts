import { type SocialSource, Source } from '@/constants/enum.js';
import { type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

async function getProfilesWithFixedTotal(
    queryCallback: (indicator?: PageIndicator) => Promise<Pageable<Profile>>,
    total: number,
) {
    let data: Profile[] = [];
    let indicator: PageIndicator | undefined;
    let retry = 10;

    while (data.length < total && retry > 0) {
        const result = await queryCallback(indicator);
        const newData =
            result.data?.filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following) ?? [];
        data = [...data, ...newData].slice(0, total);
        retry -= 1;
        if (data.length < total && result.nextIndicator) {
            indicator = result.nextIndicator as PageIndicator;
        } else {
            break;
        }
    }

    return data;
}

export async function getSuggestedFollows(source: SocialSource) {
    if (source === Source.Twitter) return [];
    const provider = resolveSocialMediaProvider(source);
    return getProfilesWithFixedTotal(provider.getSuggestedFollows, 50);
}
