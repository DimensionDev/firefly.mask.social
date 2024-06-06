'use client';

import { t } from '@lingui/macro';

import { FollowingArticleList } from '@/components/Article/FollowingArticleList.js';
import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { FollowingPostList } from '@/components/Posts/FollowingPostList.js';
import { Source } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Following() {
    const currentSource = useGlobalState.use.currentSource();

    useNavigatorTitle(t`Following`);

    if (currentSource === Source.Article) {
        return <FollowingArticleList />;
    }

    if (currentSource === Source.NFTs) {
        return <FollowingNFTList />;
    }

    return <FollowingPostList />;
}
