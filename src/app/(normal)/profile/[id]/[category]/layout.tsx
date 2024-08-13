'use client';
import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { usePathname, useSearchParams } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { Title } from '@/components/Profile/Title.js';
import { FollowCategory, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { getProfileById } from '@/services/getProfileById.js';

interface Props extends PropsWithChildren {
    params: {
        id: string;
        FollowCategory: FollowCategory;
    };
}

export default function DetailLayout({ children, params }: Props) {
    const id = params.id;
    const sourceInUrl = useSearchParams().get('source') as SourceInURL;
    const source = resolveSourceFromUrl(sourceInUrl);

    const myProfile = useCurrentProfile(narrowToSocialSource(source));

    const { data: profile = null } = useQuery({
        queryKey: ['profile', source, id],
        queryFn: async () => {
            if (!identity || !source) return null;
            if (source === Source.Twitter) return null;
            if (!id || !source || source === Source.Wallet) return null;
            return getProfileById(narrowToSocialSource(source), id);
        },
    });

    const pathname = usePathname();

    const tabs = compact([
        !isSameProfile(myProfile, profile || { source, profileId: identity })
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
            {profile ? <Title profile={profile} sticky /> : null}
            <nav className="border-b border-line bg-primaryBottom px-4">
                <ul className="scrollable-tab -mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const path = `/profile/${params.id}/${tab.category}`;
                        return (
                            <li
                                key={tab.category}
                                className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start"
                            >
                                <Link
                                    replace
                                    href={{
                                        pathname: path,
                                        query: { source: sourceInUrl },
                                    }}
                                    className={classNames(
                                        pathname === path ? 'border-b-2 border-fireflyBrand text-main' : 'text-third',
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
