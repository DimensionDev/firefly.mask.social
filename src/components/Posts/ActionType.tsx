import { t, Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo } from 'react';

import LikeIcon from '@/assets/like.svg';
import LikedIcon from '@/assets/liked.svg';
import MirrorIcon from '@/assets/mirror.svg';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { SocialPlatform } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface FeedActionType {
    post: Post;
    isThread?: boolean;
}

export const FeedActionType = memo<FeedActionType>(function FeedActionType({ post, isThread }) {
    const isComment = post.type === 'Comment';
    const showThread = isComment || !post.comments?.length;

    return (
        <div
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
        >
            {post.type === 'Mirror' ? (
                <div className="mb-3 flex items-center space-x-2 text-secondary">
                    <MirrorIcon width={16} height={16} />
                    <span>
                        <Trans>
                            <strong>{post.author.displayName}</strong> mirrored
                        </Trans>
                    </span>
                </div>
            ) : null}
            {post.mirrors?.length && !isComment ? (
                <div className="mb-3 flex items-center space-x-2 text-secondary">
                    <MirrorIcon width={16} height={16} />
                    <span>
                        <strong>{first(post.mirrors)?.displayName}</strong>{' '}
                        {post.source === SocialPlatform.Farcaster ? t`recasted` : t`mirrored`}
                    </span>
                </div>
            ) : null}
            {post.reactions?.length && !isComment ? (
                <div className="mb-3 flex items-center space-x-2 text-secondary">
                    {post.hasLiked ? <LikedIcon width={17} height={16} /> : <LikeIcon width={17} height={16} />}
                    <span>
                        <Trans>
                            <strong>{first(post.reactions)?.displayName}</strong> liked
                        </Trans>
                    </span>
                </div>
            ) : null}

            {showThread && post.root && !isThread ? <ThreadBody post={post.root} /> : null}
            {showThread && post.commentOn && !isThread ? <ThreadBody post={post.commentOn} /> : null}
        </div>
    );
});
