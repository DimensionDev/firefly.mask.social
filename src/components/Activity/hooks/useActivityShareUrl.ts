import { createLookupTableResolver } from '@masknet/shared-base';
import urlcat from 'urlcat';

import { useActivityCurrentAccountHandle } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { SITE_URL } from '@/constants/index.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';

const resolveReferralAccountPlatformFromSocialSource = createLookupTableResolver<SocialSource, ReferralAccountPlatform>(
    {
        [Source.Twitter]: ReferralAccountPlatform.X,
        [Source.Farcaster]: ReferralAccountPlatform.Farcaster,
        [Source.Lens]: ReferralAccountPlatform.Lens,
    },
    (source) => {
        throw new UnreachableError('social source', source);
    },
);

export function useActivityShareUrl(name?: string) {
    const source =
        (name
            ? (
                  {
                      hlbl: Source.Twitter,
                      elex24: Source.Twitter,
                      frensgiving: Source.Farcaster,
                      pengu: Source.Twitter,
                  } as Record<string, SocialSource>
              )[name]
            : undefined) ?? Source.Twitter;
    const handle = useActivityCurrentAccountHandle(source);
    if (!name) return urlcat(SITE_URL, PageRoute.Events);
    return urlcat(
        SITE_URL,
        resolveActivityUrl(name, {
            referralCode: handle,
            platform: resolveReferralAccountPlatformFromSocialSource(source),
        }),
    );
}
