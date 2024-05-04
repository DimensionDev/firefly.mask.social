'use client';
import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense } from 'react';

import { LikeList } from '@/components/Engagement/LikeList.js';
import { QuoteList } from '@/components/Engagement/QuoteList.js';
import { RepostList } from '@/components/Engagement/RepostList.js';
import { Loading } from '@/components/Loading.js';
import { EngagementType, SocialPlatform, type SourceInURL } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';

interface ContentListProps {
    postId: string;
    type: Props['params']['type'];
    source: SocialPlatform;
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
    };
    searchParams: {
        source: SourceInURL;
    };
}

export default function Page(props: Props) {
    const { type: engagementType, id } = props.params;
    const sourceInURL = props.searchParams.source;
    const source = resolveSocialPlatform(sourceInURL);
    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {[
                    {
                        type: EngagementType.Mirrors,
                        title: <Trans>Mirrors</Trans>,
                    },
                    {
                        type: EngagementType.Recasts,
                        title: <Trans>Recasts</Trans>,
                    },
                    {
                        type: EngagementType.Quotes,
                        title: <Trans>Quotes</Trans>,
                    },
                    {
                        type: EngagementType.Likes,
                        title: <Trans>Likes</Trans>,
                    },
                ]
                    .filter((x) => SORTED_ENGAGEMENT_TAB_TYPE[source].includes(x.type))
                    .map(({ type, title }) => (
                        <div key={type} className=" flex flex-col">
                            <Link
                                className={classNames(
                                    ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    engagementType === type ? ' text-main' : ' text-third hover:text-main',
                                )}
                                href={`/post/${id}/${type}?source=${sourceInURL}`}
                            >
                                {title}
                            </Link>
                            <span
                                className={classNames(
                                    ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                    engagementType !== type ? ' hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>
            <Suspense fallback={<Loading />}>
                <ContentList type={engagementType} source={source} postId={id} />
            </Suspense>
        </>
    );
}
