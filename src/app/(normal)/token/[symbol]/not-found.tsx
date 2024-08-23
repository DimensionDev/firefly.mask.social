'use client';

import { Trans } from '@lingui/macro';
import { useParams } from 'next/navigation.js';
import urlcat from 'urlcat';

import GhostHoleIcon from '@/assets/ghost.svg';
import { PageRoute, SearchType } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';

export default function NotFoundToken() {
    const params = useParams<{ symbol: string }>();
    const symbol = decodeURIComponent(params.symbol);
    const url = urlcat(PageRoute.Search, {
        q: `$${symbol}`,
        type: SearchType.Posts,
    });

    return (
        <div className="flex flex-col items-center py-12 text-secondary">
            <GhostHoleIcon width={200} height={143} className="text-third" />
            <div className="mt-3 break-words break-all text-center text-medium font-bold">
                <div className="mt-10">
                    <Trans>Token ${symbol} could not be found.</Trans>
                </div>
                <Link
                    className="mt-3 flex h-8 items-center justify-center rounded-full bg-main px-4 text-sm font-semibold text-primaryBottom transition-all hover:opacity-80"
                    href={url}
                >
                    <Trans>Search ${symbol}</Trans>
                </Link>
            </div>
        </div>
    );
}
