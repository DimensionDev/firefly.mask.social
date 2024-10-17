import { Reorder, useDragControls } from 'framer-motion';
import { uniq } from 'lodash-es';
import { memo, useState } from 'react';

import ReorderIcon from '@/assets/reorder.svg';
import { classNames } from '@/helpers/classNames.js';

interface SnapshotRankChoicesProps {
    choices: string[];
    disabled?: boolean;
}

export const SnapshotRankChoices = memo<SnapshotRankChoicesProps>(function SnapshotRankChoice({
    choices,
    disabled = false,
}) {
    const controls = useDragControls();
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

    return (
        <div>
            <Reorder.Group
                axis="y"
                className="mb-3 flex flex-col gap-3"
                values={selectedChoices}
                dragListener={false}
                dragControls={controls}
                onReorder={(newOrder) => {
                    setSelectedChoices(newOrder);
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
            <div className="flex flex-col gap-3">
                {choices
                    .filter((x) => !selectedChoices.includes(x))
                    .map((choice) => (
                        <div
                            key={choice}
                            className={classNames(
                                'flex items-center justify-between rounded-[10px] border border-transparent bg-white px-5 py-2 text-commonMain hover:border-lightHighlight hover:text-lightHighlight',
                                {
                                    'opacity-40': disabled,
                                },
                            )}
                            onClick={() => {
                                setSelectedChoices(uniq([...selectedChoices, choice]));
                            }}
                        >
                            <span className="text-sm font-bold leading-[18px]">{choice}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
});
