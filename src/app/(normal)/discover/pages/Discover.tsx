'use client';

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
    if (source === Source.Snapshot) {
        return <DiscoverSnapshotList />;
    }
    if (source === Source.Article) {
        return <DiscoverArticleList />;
    }

    if (source === Source.NFTs) {
        return <DiscoverNFTList />;
    }

    return <DiscoverPostList source={source} />;
}
