import { useState } from 'react';

import RightAnswerIcon from '@/assets/right-answer.svg';
import { classNames } from '@/helpers/classNames.js';

interface PollCardProps {}

// TODO: Just ui component, need to implement the logic
export function PollCard() {
    const [userVote, setUserVote] = useState<string>();
    const options = [
        { label: 'Option A', votes: 5 },
        { label: 'Option B', votes: 3 },
        { label: 'Option C', votes: 0 },
    ];
    const hasVoted = !!userVote;

    const voteCount = options.reduce((sum, current) => sum + current.votes, 0);

    const toResultRate = (current: number) => {
        return parseFloat(((current / voteCount) * 100).toFixed(2));
    };
    const handleVote = (vote: string) => {
        if (hasVoted) return;
        setUserVote(vote);
    };

    return (
        <div>
            {options.map((option, index) => {
                const rate = toResultRate(option.votes);
                const voteBarWidth = hasVoted ? (rate > 0 ? `${rate}%` : '20px') : 0;
                return (
                    <div
                        className={classNames(
                            'relative mt-3 h-10 overflow-hidden rounded-[10px] border leading-10',
                            hasVoted ? 'border-transparent' : 'border-lightMain',
                        )}
                        key={index}
                    >
                        <div
                            className="absolute left-0 top-0 h-full rounded-[10px] bg-lightBg transition-all delay-100 duration-[800] ease-in-out"
                            style={{ width: voteBarWidth }}
                        />
                        <div
                            className={classNames(
                                'absolute left-0 top-0 z-10 flex h-full w-full items-center rounded-[10px] pl-5 pr-2 text-base font-bold text-lightMain',
                                hasVoted ? 'justify-between' : 'justify-center hover:bg-lightBg',
                            )}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                handleVote(option.label);
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <span>{option.label}</span>
                                {userVote === option.label ? (
                                    <RightAnswerIcon className="mr-2" width={20} height={20} />
                                ) : null}
                            </span>
                            {hasVoted ? <span>{rate}%</span> : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
