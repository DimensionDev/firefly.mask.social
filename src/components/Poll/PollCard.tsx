import { sumBy } from 'lodash-es';
import { Fragment, useState } from 'react';

import RightAnswerIcon from '@/assets/right-answer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { POLL_ACTION_ENABLED } from '@/constants/poll.js';
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
    userChoice?: string;
}

function VoteButton ({ option, post }: VoteButtonProps) {
    const isLogin = useIsLogin(post.source);

    const handleVote = () => {
        enqueueErrorMessage('Not implemented yet');
    };

    return (
        <div className='mt-3'>
            <ClickableButton
                disabled={!isLogin}
                className='h-10 leading-10 w-full text-center text-base font-bold text-lightMain rounded-[10px] border border-lightMain disabled:!cursor-default disabled:!opacity-100 hover:bg-secondaryMain'
                onClick={handleVote}
            >{option.label}</ClickableButton>
        </div>
    );
}

function VoteResult ({ option, totalVotes, userChoice }: VoteResultProps) {
    const { label, votes = 0 } = option;
    const currentRate = totalVotes ? parseFloat(((votes / totalVotes) * 100).toFixed(2)) : 0;

    return (
        <div className='relative h-10 mt-3'>
            <div
                className='absolute h-full bg-secondaryMain rounded-[10px]'
                style={{ width: currentRate ? `${currentRate}%` : '20px'}}
            />
            <div className='absolute z-10 h-full w-full flex justify-between items-center pl-5 text-base font-bold text-lightMain'>
                <span className="flex items-center gap-2">
                    <span>{label}</span>
                        {userChoice === label ? (
                            <RightAnswerIcon className="mr-2" width={20} height={20} />
                        ) : null}
                    </span>
                <span>{currentRate}%</span>
            </div>
        </div>
    )
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
                        <VoteResult option={option} totalVotes={totalVotes} userChoice={userVote} />
                    ) : (
                        <VoteButton option={option} post={post} />
                    )}
                </Fragment>
            ))}
        </div>
    );
}
