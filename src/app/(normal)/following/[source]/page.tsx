import { FollowingArticleList } from '@/components/Article/FollowingArticleList.js';
import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { PolymarketTimeLine } from '@/components/Polymarket/PolymarketTimeLine.js';
import { FollowingPostList } from '@/components/Posts/FollowingPostList.js';
import { FollowingSnapshotList } from '@/components/Snapshot/FollowingSnapshotList.js';
import { type FollowingSource, Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';

export default async function Page(props: { params: Promise<{ source: SourceInURL }> }) {
    const params = await props.params;
    const source = resolveSource(params.source) as FollowingSource;
    if (source === Source.DAOs) {
        return <FollowingSnapshotList />;
    }
    if (source === Source.Article) {
        return <FollowingArticleList />;
    }

    if (source === Source.NFTs) {
        return <FollowingNFTList />;
    }

    if (source === Source.Polymarket) {
        return <PolymarketTimeLine isFollowing />;
    }

    return <FollowingPostList source={source} />;
}
