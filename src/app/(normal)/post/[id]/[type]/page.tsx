'use client';
import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { LikeList } from '@/components/Engagement/LikeList.js';
import { QuoteList } from '@/components/Engagement/QuoteList.js';
import { RepostList } from '@/components/Engagement/RepostList.js';
import { Loading } from '@/components/Loading.js';
import { EngagementType, type SocialSource, type SocialSourceInURL } from '@/constants/enum.js';
import { SORTED_ENGAGEMENT_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useComeBack } from '@/hooks/useComeback.js';

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
    };
    searchParams: {
        source: SocialSourceInURL;
    };
}

export default function Page(props: Props) {
    const { type: engagementType, id } = props.params;
    const sourceInURL = props.searchParams.source;
    const source = resolveSocialSource(sourceInURL);

    const comeback = useComeBack();

    return (
        <>
            <div className="sticky top-0 z-20 flex items-center gap-5 border-b border-lightLineSecond bg-primaryBottom px-5 dark:border-line">
                <ComeBack width={24} height={24} className="mr-2 cursor-pointer" onClick={comeback} />
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
                        <div key={type} className="flex flex-col">
                            <Link
                                replace
                                className={classNames(
                                    'flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    engagementType === type ? 'text-main' : 'text-third hover:text-main',
                                )}
                                href={`/post/${id}/${type}?source=${sourceInURL}`}
                            >
                                {title}
                            </Link>
                            <span
                                className={classNames(
                                    'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                    engagementType !== type ? 'hidden' : '',
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
