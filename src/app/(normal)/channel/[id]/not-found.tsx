'use client';

import { t } from '@lingui/macro';
import { useParams } from 'next/navigation.js';

import NotFound from '@/components/NotFound.js';
import { SearchType } from '@/constants/enum.js';

export default function ChannelNotFound() {
    const params = useParams<{ id: string }>();
    const id = decodeURIComponent(params.id);

    return (
        <NotFound
            backText={t`Channel`}
            text={t`Channel ${id} could not be found.`}
            search={{ text: t`Search ${id}`, searchText: id, searchType: SearchType.Channels }}
        />
    );
}
