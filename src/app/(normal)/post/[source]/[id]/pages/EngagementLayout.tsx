'use client';

import { Trans } from '@lingui/macro';
import { type PropsWithChildren, useMemo } from 'react';

import { Comeback } from '@/components/Comeback.js';
import { SecondTabs } from '@/components/Tabs/SecondTabs.js';
import { EngagementType, type SocialSource } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { resolveEngagementUrl } from '@/helpers/resolveEngagementUrl.js';

export function EngagementLayout({
    id,
    type: engagementType,
    source,
    children,
}: PropsWithChildren<{
    id: string;
    type: EngagementType;
    source: SocialSource;
}>) {
    const tabs = useMemo(
        () =>
            [
                {
                    value: EngagementType.Mirrors,
                    title: <Trans>Mirrors</Trans>,
                    link: resolveEngagementUrl(id, source, EngagementType.Mirrors),
                },
                {
                    value: EngagementType.Recasts,
                    title: <Trans>Recasts</Trans>,
                    link: resolveEngagementUrl(id, source, EngagementType.Recasts),
                },
                {
                    value: EngagementType.Quotes,
                    title: <Trans>Quotes</Trans>,
                    link: resolveEngagementUrl(id, source, EngagementType.Quotes),
                },
                {
                    value: EngagementType.Likes,
                    title: <Trans>Likes</Trans>,
                    link: resolveEngagementUrl(id, source, EngagementType.Likes),
                },
            ].filter((x) => SORTED_ENGAGEMENT_TAB_TYPE[source].includes(x.value)),
        [source, id],
    );
    return (
        <>
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <Comeback className="mr-[30px]" />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Post engagements</Trans>
                </h2>
            </div>
            <SecondTabs<EngagementType> items={tabs} current={engagementType} />
            {children}
        </>
    );
}
