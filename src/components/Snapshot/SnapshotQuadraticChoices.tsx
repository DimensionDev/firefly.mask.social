import { sum } from 'lodash-es';
import { memo, useState } from 'react';

import { type QuadraticChoice, SnapshotQuadraticChoice } from '@/components/Snapshot/SnapshotQuadraticChoice.js';

interface SnapshotQuadraticChoicesProps {
    choices: string[];
    disabled?: boolean;
}

export const SnapshotQuadraticChoices = memo<SnapshotQuadraticChoicesProps>(function SnapshotQuantitativeChoices({
    choices,
    disabled = false,
}) {
    const [choicesState, setChoicesState] = useState<QuadraticChoice[]>(
        choices.map((choice) => ({
            label: choice,
            quantity: 0,
        })),
    );

    const total = sum(choicesState.map((x) => x.quantity));

    return (
        <div className="flex flex-col gap-3">
            {choicesState.map((choice) => (
                <SnapshotQuadraticChoice
                    disabled={disabled}
                    key={choice.label}
                    choice={choice}
                    onChange={(value) => {
                        setChoicesState((state) => state.map((x) => (x.label === value.label ? value : x)));
                    }}
                    total={total}
                />
            ))}
        </div>
    );
});
