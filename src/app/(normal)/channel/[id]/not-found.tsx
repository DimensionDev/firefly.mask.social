'use client';

import { t, Trans } from '@lingui/macro';
import { useParams } from 'next/navigation.js';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';

export default function ChannelNotFound() {
    const params = useParams<{ id: string }>();
    const id = decodeURIComponent(params.id);

    return (
        <NotFound
            backText={<Trans>Channel</Trans>}
            text={<Trans>Channel {id} could not be found.</Trans>}
            search={{ text: <Trans>Search {id}</Trans>, searchText: id, searchType: SearchType.Channels }}
        />
    );
}
