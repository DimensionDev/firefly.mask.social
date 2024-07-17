'use client';
import { Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation.js';
import type React from 'react';
import type { PropsWithChildren } from 'react';

import { Title } from '@/components/Profile/Title.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';
import { FollowCategory } from '@/types/social.js';

interface Props extends PropsWithChildren {
    params: {
        id: string;
        FollowCategory: FollowCategory;
    };
}

const tabs = [
    {
        label: <Trans>Followers you know</Trans>,
        category: FollowCategory.Mutuals,
    },
    {
        label: <Trans>Following</Trans>,
        category: FollowCategory.Following,
    },
    {
        label: <Trans>Followers</Trans>,
        category: FollowCategory.Followers,
    },
] as const;

export default function DetailLayout({ children, params }: Props) {
    const searchParams = useSearchParams();
    const rawSource = searchParams.get('source') as SourceInURL;
    const source = resolveSourceFromUrl(rawSource);
    const identity = params.id;

    const { data: profile = null } = useSuspenseQuery({
        queryKey: ['profile', source, identity],
        queryFn: async () => {
            if (!identity || !source || source === Source.Wallet) return null;
            if (source === Source.Twitter) return null;
            return getProfileById(narrowToSocialSource(source), identity);
        },
    });

    const pathname = usePathname();

    return (
        <>
            {profile ? <Title profile={profile} /> : null}
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
                                        query: { source: rawSource },
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
