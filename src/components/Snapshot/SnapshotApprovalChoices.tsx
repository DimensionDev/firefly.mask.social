import { uniq } from 'lodash-es';
import { memo } from 'react';

import { SnapshotChoice } from '@/components/Snapshot/SnapshotChoice.js';

interface SnapshotApprovalChoicesProps {
    choices: string[];
    value?: number[];
    disabled?: boolean;
    onChange?: (index: number[]) => void;
}

export const SnapshotApprovalChoices = memo<SnapshotApprovalChoicesProps>(function SnapshotApprovalChoices({
    choices,
    disabled,
    onChange,
    value = [],
}) {
    return (
        <div className="flex flex-col gap-3">
            {choices.map((choice, index) => {
                const optionIndex = index + 1;
                return (
                    <SnapshotChoice
                        key={choice}
                        value={choice}
                        selected={value?.includes(index + 1)}
                        onClick={() => {
                            onChange?.(
                                value?.includes(optionIndex)
                                    ? value.filter((x) => x !== optionIndex)
                                    : uniq([...value, optionIndex]),
                            );
                        }}
                        disabled={disabled}
                    />
                );
            })}
        </div>
    );
});
