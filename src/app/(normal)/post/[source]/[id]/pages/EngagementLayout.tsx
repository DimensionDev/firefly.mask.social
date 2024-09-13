'use client';

import { Trans } from '@lingui/macro';
import type { PropsWithChildren } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { EngagementType, type SocialSource } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveEngagementUrl } from '@/helpers/resolveEngagementUrl.js';
import { useComeBack } from '@/hooks/useComeback.js';

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
    const comeback = useComeBack();
    return (
        <>
            <div className="sticky top-0 z-20 flex items-center gap-5 border-b border-lightLineSecond bg-primaryBottom px-5 dark:border-line">
                <ComeBack width={24} height={24} className="mr-2 cursor-pointer" onClick={comeback} />
                {[
                    {
                        type: EngagementType.Mirrors,
                        title: <Trans>Mirrors</Trans>,
                    },
                    {
                        type: EngagementType.Recasts,
                        title: <Trans>Recasts</Trans>,
                    },
                    {
                        type: EngagementType.Quotes,
                        title: <Trans>Quotes</Trans>,
                    },
                    {
                        type: EngagementType.Likes,
                        title: <Trans>Likes</Trans>,
                    },
                ]
                    .filter((x) => SORTED_ENGAGEMENT_TAB_TYPE[source].includes(x.type))
                    .map(({ type, title }) => (
                        <div key={type} className="flex flex-col">
                            <Link
                                replace
                                className={classNames(
                                    'flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    engagementType === type ? 'text-main' : 'text-third hover:text-main',
                                )}
                                href={resolveEngagementUrl(id, source, type)}
                            >
                                {title}
                            </Link>
                            <span
                                className={classNames(
                                    'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                    engagementType !== type ? 'hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>
            {children}
        </>
    );
}
