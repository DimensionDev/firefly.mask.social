'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { Title } from '@/components/Profile/Title.js';
import { FollowCategory, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';

export function FollowPageLayout({
    identity,
    children,
    category,
}: PropsWithChildren<{ identity: FireflyIdentity; category: FollowCategory }>) {
    const { id } = identity;
    const source = narrowToSocialSource(identity.source);
    const myProfile = useCurrentProfile(source);

    const { data: profile = null } = useQuery({
        queryKey: ['profile', source, id],
        queryFn: async () => {
            if (!id || !source) return null;
            if (source === Source.Twitter) return null;
            return getProfileById(source, id);
        },
    });

    const pathname = usePathname();

    const tabs = compact([
        !isSameProfile(myProfile, profile || { source, profileId: id })
            ? {
                  label: <Trans>Followers you know</Trans>,
                  category: FollowCategory.Mutuals,
              }
            : null,
        {
            label: <Trans>Following</Trans>,
            category: FollowCategory.Following,
        },
        {
            label: <Trans>Followers</Trans>,
            category: FollowCategory.Followers,
        },
    ]);

    return (
        <>
            {profile ? (
                <>
                    <Title profile={profile} sticky keepVisible disableActions className="border-b border-line" />
                    <div className="h-12" />
                </>
            ) : null}
            <nav className="border-b border-line bg-primaryBottom px-4">
                <ul className="scrollable-tab -mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map((tab) => {
                        return (
                            <li
                                key={tab.category}
                                className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start"
                            >
                                <Link
                                    replace
                                    href={resolveProfileUrl(source, id, tab.category)}
                                    className={classNames(
                                        category === tab.category
                                            ? 'border-b-2 border-fireflyBrand text-main'
                                            : 'text-third',
                                        'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                                        'md:h-[60px] md:py-[18px] md:leading-6',
                                    )}
                                >
                                    {tab.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            {children}
        </>
    );
}