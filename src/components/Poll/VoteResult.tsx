import RightAnswerIcon from '@/assets/right-answer.svg';
import { classNames } from '@/helpers/classNames.js';
import type { PollOption } from '@/providers/types/Poll.js';

interface VoteResultProps {
    option: PollOption;
    totalVotes: number;
    maxPercent: number;
}

export function VoteResult({ option, totalVotes, maxPercent }: VoteResultProps) {
    const { label, votes = 0, percent } = option;
    const currentRate = percent ?? (totalVotes ? parseFloat(((votes / totalVotes) * 100).toFixed(2)) : 0);

    const isUserVoted = option.isVoted ?? false;
    const isMaxPercent = !!currentRate && currentRate === maxPercent;

    return (
        <div className="relative mt-3 h-10">
            <div
                className="absolute h-full rounded-[10px] bg-[#EEEEF6] dark:bg-secondaryMain"
                style={{ width: currentRate ? `${currentRate}%` : '20px' }}
            />
            <div className="absolute z-10 flex h-full w-full items-center justify-between pl-5 text-base font-bold text-lightMain">
                <span
                    className={classNames('mr-2 flex items-center gap-2 truncate', {
                        'text-lightHighlight': isUserVoted,
                        'text-lightMain': !isUserVoted && isMaxPercent,
                        'text-lightSecond': !isUserVoted && !isMaxPercent,
                    })}
                >
                    <span className="overflow-hidden">{label}</span>
                    {isUserVoted ? <RightAnswerIcon className="mr-2 shrink-0" width={20} height={20} /> : null}
                </span>
                <span className={isMaxPercent ? 'text-lightMain' : 'text-third'}>{currentRate}%</span>
            </div>
        </div>
    );
}
