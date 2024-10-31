'use client';

import { useContext } from 'react';

import TickSquareIcon from '@/assets/tick-square.svg';
import { ActivityElex24Context } from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Image } from '@/components/Image.js';
import { ActivityElex24VoteOption } from '@/providers/types/Activity.js';

export function ActivityElex24Vote() {
    const { setVote, vote } = useContext(ActivityElex24Context);
    const { data } = useActivityClaimCondition();
    const options = [
        {
            icon: '/image/activity/elex24/trump-basic.png',
            name: 'Donald Trump',
            value: ActivityElex24VoteOption.Trump,
        },
        {
            icon: '/image/activity/elex24/harris-basic.png',
            name: 'Kamala Harris',
            value: ActivityElex24VoteOption.Harris,
        },
    ];

    return (
        <div className="flex flex-col space-y-2">
            {options.map((option) => {
                const selected = vote === option.value || option.value === data?.ext?.vote;
                return (
                    <button
                        key={option.name}
                        className="flex h-12 rounded-2xl bg-bg p-3 text-sm font-semibold leading-6 disabled:bg-success/10 disabled:dark:bg-success/20"
                        disabled={selected}
                        onClick={() => {
                            if (data?.ext?.vote) return;
                            setVote(option.value);
                        }}
                    >
                        <Image src={option.icon} alt={option.name} width={24} height={24} className="mr-2 h-6 w-6" />
                        <span>{option.name}</span>
                        {selected ? <TickSquareIcon className="ml-auto h-6 w-6 shrink-0 text-success" /> : null}
                    </button>
                );
            })}
        </div>
    );
}
