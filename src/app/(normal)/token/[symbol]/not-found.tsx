'use client';

import { Trans } from '@lingui/macro';
import { useParams } from 'next/navigation.js';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';

export default function NotFoundToken() {
    const params = useParams<{ symbol: string }>();
    const symbol = decodeURIComponent(params.symbol);

    return (
        <NotFound
            text={<Trans>Token ${symbol} could not be found.</Trans>}
            search={{ text: <Trans>Search ${symbol}</Trans>, searchText: `$${symbol}`, searchType: SearchType.Tokens }}
        />
    );
}
