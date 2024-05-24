import { sumBy } from 'lodash-es';
import { Fragment, useState } from 'react';

import RightAnswerIcon from '@/assets/right-answer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { POLL_ACTION_ENABLED } from '@/constants/poll.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { PollOption } from '@/providers/types/Poll.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PollCardProps {
    post: Post;
}
interface VoteButtonProps {
    option: PollOption;
    post: Post;
}
interface VoteResultProps {
    option: PollOption;
    totalVotes: number;
    isUserVoted: boolean;
}

function VoteButton({ option, post }: VoteButtonProps) {
    const isLogin = useIsLogin(post.source);

    const handleVote = () => {
        enqueueErrorMessage('Not implemented yet');
    };

    return (
        <div className="mt-3">
            <ClickableButton
                disabled={!isLogin}
                className="h-10 w-full rounded-[10px] border border-lightMain text-center text-base font-bold leading-10 text-lightMain hover:text-link hover:border-link disabled:!cursor-default disabled:!opacity-100"
                onClick={handleVote}
            >
                {option.label}
            </ClickableButton>
        </div>
    );
}

function VoteResult({ option, totalVotes, isUserVoted }: VoteResultProps) {
    const { label, votes = 0 } = option;
    const currentRate = totalVotes ? parseFloat(((votes / totalVotes) * 100).toFixed(2)) : 0;

    return (
        <div className="relative mt-3 h-10">
            <div
                className={classNames(
                    "absolute h-full rounded-[10px]",
                    isUserVoted ? 'bg-link' : 'bg-secondaryMain'
                )}
                style={{ width: currentRate ? `${currentRate}%` : '20px' }}
            />
            <div className="absolute z-10 flex h-full w-full items-center justify-between pl-5 text-base font-bold text-lightMain">
                <span className="flex items-center gap-2">
                    <span>{label}</span>
                    {isUserVoted ? <RightAnswerIcon className="mr-2" width={20} height={20} /> : null}
                </span>
                <span>{currentRate}%</span>
            </div>
        </div>
    );
}

export function PollCard({ post }: PollCardProps) {
    const [userVote] = useState<string>();
    const profile = useCurrentProfile(post.source);

    const { poll } = post;
    if (!poll) return null;

    const totalVotes = sumBy(poll.options, (option) => option.votes ?? 0);

    const showResultsOnly =
        !POLL_ACTION_ENABLED[post.source] ||
        poll.votingStatus === 'closed' ||
        isSameProfile(profile, post.author) ||
        !!userVote;

    return (
        <div>
            {poll.options.map((option, index) => (
                <Fragment key={index}>
                    {showResultsOnly ? (
                        <VoteResult option={option} totalVotes={totalVotes} isUserVoted={userVote === option.label} />
                    ) : (
                        <VoteButton option={option} post={post} />
                    )}
                </Fragment>
            ))}
        </div>
    );
}
