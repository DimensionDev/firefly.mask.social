'use client';

import { t } from '@lingui/macro';
import { useParams } from 'next/navigation.js';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';

export default function NotFoundToken() {
    const params = useParams<{ symbol: string }>();
    const symbol = decodeURIComponent(params.symbol);

    return (
        <NotFound
            text={t`Token ${symbol} could not be found.`}
            search={{ text: t`Search $${symbol}`, searchText: `$${symbol}`, searchType: SearchType.Tokens }}
        />
    );
}
