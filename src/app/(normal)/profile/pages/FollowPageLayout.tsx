'use client';

import { Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { type PropsWithChildren, useMemo } from 'react';

import { SecondTabs } from '@/components/Tabs/SecondTabs.js';
import { FollowCategory } from '@/constants/enum.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function FollowPageLayout({
    identity,
    children,
    category,
    profile,
}: PropsWithChildren<{ identity: FireflyIdentity; category: FollowCategory; profile: Profile }>) {
    const { id } = identity;
    const source = narrowToSocialSource(identity.source);
    const myProfile = useCurrentProfile(source);

    const tabs = useMemo(
        () =>
            compact([
                !isSameProfile(myProfile, profile || { source, profileId: id })
                    ? {
                          title: <Trans>Followers you know</Trans>,
                          value: FollowCategory.Mutuals,
                          link: resolveProfileUrl(source, id, FollowCategory.Mutuals),
                      }
                    : null,
                {
                    title: <Trans>Following</Trans>,
                    value: FollowCategory.Following,
                    link: resolveProfileUrl(source, id, FollowCategory.Following),
                },
                {
                    title: <Trans>Followers</Trans>,
                    value: FollowCategory.Followers,
                    link: resolveProfileUrl(source, id, FollowCategory.Followers),
                },
            ]),
        [myProfile, profile, source, id],
    );

    return (
        <>
            <SecondTabs<FollowCategory> items={tabs} current={category} />
            {children}
        </>
    );
}
