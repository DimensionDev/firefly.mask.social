'use client';

import { Trans } from '@lingui/macro';
import { useParams } from 'next/navigation.js';
import urlcat from 'urlcat';

import { BaseNotFound } from '@/components/BaseNotFound.js';
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
        <BaseNotFound>
            <div className="mt-11 text-sm font-bold">
                <Trans>Token ${symbol} could not be found.</Trans>
            </div>
            <Link
                className="mt-3 flex h-8 items-center justify-center rounded-full bg-main px-4 text-sm font-semibold text-primaryBottom transition-all hover:opacity-80"
                href={url}
            >
                <Trans>Search ${symbol}</Trans>
            </Link>
        </BaseNotFound>
    );
}
