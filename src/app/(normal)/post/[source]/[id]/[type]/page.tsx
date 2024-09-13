'use client';

import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense } from 'react';

import { LikeList } from '@/components/Engagement/LikeList.js';
import { QuoteList } from '@/components/Engagement/QuoteList.js';
import { RepostList } from '@/components/Engagement/RepostList.js';
import { Loading } from '@/components/Loading.js';
import { EngagementType, type SocialSource, type SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

interface ContentListProps {
    postId: string;
    type: Props['params']['type'];
    source: SocialSource;
}
const ContentList = memo(function ContentList(props: ContentListProps) {
    switch (props.type) {
        case EngagementType.Likes:
            return <LikeList {...props} />;
        case EngagementType.Mirrors:
        case EngagementType.Recasts:
            return <RepostList {...props} />;
        case EngagementType.Quotes:
            return <QuoteList {...props} />;
        default:
            safeUnreachable(props.type);
            return null;
    }
});

interface Props {
    params: {
        id: string;
        type: EngagementType;
        source: SocialSourceInURL;
    };
}

export default function Page(props: Props) {
    const { type: engagementType, id } = props.params;
    const sourceInURL = props.params.source;
    const source = resolveSocialSource(sourceInURL);

    return (
        <Suspense fallback={<Loading />}>
            <ContentList type={engagementType} source={source} postId={id} />
        </Suspense>
    );
}
