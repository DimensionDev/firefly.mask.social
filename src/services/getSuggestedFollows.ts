import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

async function getProfilesWithFixedTotal(
    queryCallback: (indicator?: PageIndicator) => Promise<Pageable<Profile>>,
    compose: (oldData: Profile[], newData: Profile[]) => Profile[],
    total: number,
    initialIndicator?: PageIndicator,
) {
    let data: Profile[] = [];
    let indicator: PageIndicator | undefined = initialIndicator;
    let retry = 10;

    while (data.length < total && retry > 0) {
        const result = await queryCallback(indicator);
        data = compose(data, result.data);
        retry -= 1;
        indicator = result.nextIndicator as PageIndicator;
        if (data.length < total && !indicator) {
            break;
        }
    }

    return createPageable(data, createIndicator(undefined), indicator);
}

export async function getSuggestedFollowsInCard(source: SocialSource) {
    if (source === Source.Twitter) return [];
    const provider = resolveSocialMediaProvider(source);
    const result = await getProfilesWithFixedTotal(
        provider.getSuggestedFollows,
        (oldData, newData) =>
            [
                ...oldData,
                ...newData.filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following),
            ].slice(0, 50),
        50,
    );

    return result.data ?? [];
}

export async function getSuggestedFollowsInPage(source: SocialSource, indicator?: PageIndicator) {
    if (source === Source.Twitter) return createPageable<Profile>(EMPTY_LIST, createIndicator(undefined));
    const provider = resolveSocialMediaProvider(source);
    return getProfilesWithFixedTotal(
        provider.getSuggestedFollows,
        (oldData, newData) => [...oldData, ...newData],
        1,
        indicator,
    );
}
