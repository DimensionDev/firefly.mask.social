import { useState } from 'react';

import RightAnswerIcon from '@/assets/right-answer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.jsx';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PollCardProps {
    post: Post;
}

export function PollCard({ post }: PollCardProps) {
    const [userVote] = useState<string>();
    const profile = useCurrentProfile(post.source);

    const { poll } = post;
    if (!poll) return null;

    const voteDisabled = post.poll?.votingStatus === 'closed' || !profile || isSameProfile(profile, post.author);

    const toResultRate = (current: number) => {
        const voteCount = poll.options.reduce((sum, current) => sum + (current.votes ?? 0), 0);
        return parseFloat(((current / voteCount) * 100).toFixed(2));
    };
    const handleVote = (optionLabel: string) => {
        enqueueErrorMessage('Not implemented yet');
    };

    return (
        <div>
            {poll.options.map((option, index) => {
                const rate = toResultRate(option.votes ?? 0);
                const voteBarWidth = voteDisabled ? (rate > 0 ? `${rate}%` : '20px') : 0;
                return (
                    <div
                        className={classNames(
                            'relative mt-3 h-10 overflow-hidden rounded-[10px] border leading-10',
                            voteDisabled ? 'border-transparent' : 'border-lightMain',
                        )}
                        key={index}
                    >
                        <div
                            className="absolute left-0 top-0 h-full rounded-[10px] bg-lightBg transition-all delay-100 duration-[800] ease-in-out"
                            style={{ width: voteBarWidth }}
                        />
                        <ClickableButton
                            disabled={voteDisabled}
                            className={classNames(
                                'absolute left-0 top-0 z-10 flex h-full w-full items-center rounded-[10px] pl-5 pr-2 text-base font-bold text-lightMain',
                                voteDisabled ? 'justify-between' : 'justify-center hover:bg-lightBg',
                            )}
                            onClick={() => {
                                handleVote(option.label);
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <span>{option.label}</span>
                                {userVote === option.label ? (
                                    <RightAnswerIcon className="mr-2" width={20} height={20} />
                                ) : null}
                            </span>
                            {voteDisabled ? <span>{rate}%</span> : null}
                        </ClickableButton>
                    </div>
                );
            })}
        </div>
    );
}
