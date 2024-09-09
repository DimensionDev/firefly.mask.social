import { sumBy } from 'lodash-es';
import { Fragment } from 'react';

import { VoteButton } from '@/components/Poll/VoteButton.js';
import { VoteResult } from '@/components/Poll/VoteResult.js';
import { POLL_ACTION_ENABLED } from '@/constants/poll.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PollCardProps {
    post: Post;
    frameUrl: string;
}

export function PollCard({ post, frameUrl }: PollCardProps) {
    const profile = useCurrentProfile(post.source);

    const { poll } = post;
    if (!poll) return null;

    const totalVotes = sumBy(poll.options, (option) => option.votes ?? 0);
    const maxPercent = Math.max(...poll.options.map((choice) => choice.percent || choice.votes || 0));

    const showResultsOnly =
        !POLL_ACTION_ENABLED[post.source] ||
        poll.votingStatus === 'closed' ||
        poll.options.some((option) => option.isVoted) ||
        isSameProfile(profile, post.author);

    return (
        <div>
            {poll.options.map((option, index) => (
                <Fragment key={index}>
                    {showResultsOnly ? (
                        <VoteResult option={option} totalVotes={totalVotes} maxPercent={maxPercent} />
                    ) : (
                        <VoteButton option={option} post={post} frameUrl={frameUrl} />
                    )}
                </Fragment>
            ))}
        </div>
    );
}
