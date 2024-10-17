import { FollowingArticleList } from '@/components/Article/FollowingArticleList.js';
import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { FollowingPostList } from '@/components/Posts/FollowingPostList.js';
import { type DiscoverSource, Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';

export default function Page({ params }: { params: { source: SourceInURL } }) {
    const source = resolveSource(params.source) as DiscoverSource;
    if (source == Source.DAO) {
        return null;
    }
    if (source === Source.Article) {
        return <FollowingArticleList />;
    }

    if (source === Source.NFTs) {
        return <FollowingNFTList />;
    }

    return <FollowingPostList source={source} />;
}
