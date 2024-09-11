import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { produce } from 'immer';
import { memo, Suspense } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { ChannelList } from '@/components/Profile/ChannelList.js';
import { CollectedList } from '@/components/Profile/CollectedList.js';
import { FeedList } from '@/components/Profile/FeedList.js';
import { LikedFeedList } from '@/components/Profile/LikedFeedList.js';
import { MediaList } from '@/components/Profile/MediaList.js';
import { RepliesList } from '@/components/Profile/RepliesList.js';
import { SocialProfileCategory, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { isSocialProfileCategory } from '@/helpers/isSocialProfileCategory.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';

const ContentList = memo(function ContentList({
    type,
    source,
    profileId,
}: {
    type: SocialProfileCategory;
    source: SocialSource;
    profileId: string;
}) {
    switch (type) {
        case SocialProfileCategory.Feed:
            return <FeedList source={source} profileId={profileId} />;
        case SocialProfileCategory.Collected:
            return <CollectedList source={source} profileId={profileId} />;
        case SocialProfileCategory.Channels:
            return <ChannelList source={source} profileId={profileId} />;
        case SocialProfileCategory.Replies:
            return <RepliesList source={source} profileId={profileId} />;
        case SocialProfileCategory.Liked:
            return <LikedFeedList source={source} profileId={profileId} />;
        case SocialProfileCategory.Media:
            return <MediaList source={source} profileId={profileId} />;
        default:
            safeUnreachable(type);
            return null;
    }
});

interface TabsProps {
    profileId: string;
    source: SocialSource;
}

export function ProfileContentTabs({ profileId, source }: TabsProps) {
    const { update, category } = ProfilePageContext.useContainer();
    function setProfileCategory(type: SocialProfileCategory) {
        update((x) =>
            produce(x, (ctx) => {
                ctx.category = type;
            }),
        );
    }

    const computedCategory =
        category && isSocialProfileCategory(source, category) ? category : SocialProfileCategory.Feed;

    return (
        <>
            <div className="scrollable-tab flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {[
                    {
                        type: SocialProfileCategory.Feed,
                        title: source === Source.Farcaster ? <Trans>Casts</Trans> : <Trans>Feed</Trans>,
                    },
                    {
                        type: SocialProfileCategory.Replies,
                        title: source === Source.Farcaster ? <Trans>Casts + Replies</Trans> : <Trans>Replies</Trans>,
                    },
                    {
                        type: SocialProfileCategory.Liked,
                        title: <Trans>Likes</Trans>,
                    },
                    {
                        type: SocialProfileCategory.Media,
                        title: <Trans>Media</Trans>,
                    },
                    {
                        type: SocialProfileCategory.Collected,
                        title: <Trans>Collected</Trans>,
                    },
                    {
                        type: SocialProfileCategory.Channels,
                        title: <Trans>Channels</Trans>,
                    },
                ]
                    .filter((x) => SORTED_PROFILE_TAB_TYPE[source].includes(x.type))
                    .map(({ type, title }) => (
                        <div key={type} className="flex flex-col">
                            <ClickableButton
                                className={classNames(
                                    'flex h-[46px] items-center whitespace-nowrap px-[14px] font-extrabold transition-all',
                                    computedCategory === type ? 'text-main' : 'text-third hover:text-main',
                                )}
                                onClick={() => setProfileCategory(type)}
                            >
                                {title}
                            </ClickableButton>
                            <span
                                className={classNames(
                                    'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                    computedCategory !== type ? 'hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>

            <Suspense fallback={<Loading />}>
                <ContentList type={computedCategory} source={source} profileId={profileId} />
            </Suspense>
        </>
    );
}
