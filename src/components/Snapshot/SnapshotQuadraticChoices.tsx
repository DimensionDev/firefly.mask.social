import { sum } from 'd3';
import { values } from 'lodash-es';
import { memo } from 'react';

import { SnapshotQuadraticChoice } from '@/components/Snapshot/SnapshotQuadraticChoice.js';

interface SnapshotQuadraticChoicesProps {
    value?: { [key: string]: number };
    choices: string[];
    disabled?: boolean;
    onChange?: (value: { [key: string]: number }) => void;
}

export const SnapshotQuadraticChoices = memo<SnapshotQuadraticChoicesProps>(function SnapshotQuantitativeChoices({
    choices,
    disabled = false,
    onChange,
    value,
}) {
    const total = value ? sum(values(value)) : 0;

    return (
        <div className="flex flex-col gap-3">
            {choices.map((choice, index) => {
                const optionIndex = index + 1;

                return (
                    <SnapshotQuadraticChoice
                        label={choice}
                        key={choice}
                        quantity={value?.[optionIndex] || 0}
                        disabled={disabled}
                        onChange={(quantity) => {
                            onChange?.({
                                ...(value ?? {}),
                                [optionIndex]: quantity,
                            });
                        }}
                        total={total}
                    />
                );
            })}
        </div>
    );
});
