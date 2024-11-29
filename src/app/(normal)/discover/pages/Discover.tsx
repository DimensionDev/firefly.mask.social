'use client';

import { safeUnreachable } from '@masknet/kit';
import React from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { DiscoverSnapshotList } from '@/components/Snapshot/DiscoverSnapshotList.js';
import { type DiscoverSource, Source } from '@/constants/enum.js';

interface Props {
    source: DiscoverSource;
}

export function DiscoverPage({ source }: Props) {
    switch (source) {
        case Source.DAOs:
            return <DiscoverSnapshotList />;
        case Source.Article:
            return <DiscoverArticleList />;
        case Source.NFTs:
            return <DiscoverNFTList />;
        case Source.Farcaster:
        case Source.Lens:
            return <DiscoverPostList source={source} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
