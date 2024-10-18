import { memo } from 'react';

import { SnapshotChoice } from '@/components/Snapshot/SnapshotChoice.js';

interface SnapshotSingleChoicesProps {
    choices: string[];
    value?: number;
    disabled?: boolean;
    onChange?: (index?: number) => void;
}

export const SnapshotSingleChoices = memo<SnapshotSingleChoicesProps>(function SnapshotSingleChoices({
    choices,
    disabled = false,
    onChange,
    value,
}) {
    return (
        <div className="flex flex-col gap-3">
            {choices.map((choice, index) => {
                const optionIndex = index + 1;
                return (
                    <SnapshotChoice
                        key={choice}
                        value={choice}
                        selected={value === index + 1}
                        onClick={() => {
                            onChange?.(!(value && value === optionIndex) ? optionIndex : undefined);
                        }}
                        disabled={disabled}
                    />
                );
            })}
        </div>
    );
});
