import { Reorder } from 'framer-motion';
import { memo } from 'react';

import ReorderIcon from '@/assets/reorder.svg';
import { classNames } from '@/helpers/classNames.js';

interface SnapshotRankChoicesProps {
    choices: string[];
    disabled?: boolean;
    value?: number[];
    onChange?: (value: number[]) => void;
}

export const SnapshotRankChoices = memo<SnapshotRankChoicesProps>(function SnapshotRankChoice({
    choices,
    disabled = false,
    onChange,
    value = [],
}) {
    const selectedChoices = value.map((value) => {
        return choices[value - 1];
    });

    return (
        <div>
            {selectedChoices.length ? (
                <Reorder.Group
                    axis="y"
                    className="mb-3 flex flex-col gap-3"
                    values={selectedChoices}
                    onReorder={(newOrder) => {
                        onChange?.(newOrder.map((x) => choices.indexOf(x) + 1));
                    }}
                >
                    {selectedChoices.map((choice, index) => {
                        return (
                            <Reorder.Item key={choice} value={choice}>
                                <div
                                    className={classNames(
                                        'flex items-center justify-between rounded-[10px] border border-lightHighlight bg-white px-5 py-2 text-lightHighlight',
                                        {
                                            'opacity-40': disabled,
                                        },
                                    )}
                                >
                                    <span className="text-sm font-bold leading-[18px]">
                                        #{index + 1} {choice}
                                    </span>
                                    <ReorderIcon width={16} height={16} />
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            ) : null}
            <div className="flex flex-col gap-3">
                {choices
                    .filter((x) => !selectedChoices.includes(x))
                    .map((choice) => (
                        <div
                            key={choice}
                            className={classNames(
                                'flex items-center justify-between rounded-[10px] border border-transparent bg-white px-5 py-2 text-commonMain',
                                {
                                    'hover:border-lightHighlight hover:text-lightHighlight': !disabled,
                                    'opacity-40': disabled,
                                },
                            )}
                            onClick={() => {
                                onChange?.([...selectedChoices, choice].map((x) => choices.indexOf(x) + 1));
                            }}
                        >
                            <span className="text-sm font-bold leading-[18px]">{choice}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
});
