import { uniq } from 'lodash-es';
import { memo, useState } from 'react';

import { SnapshotChoice } from '@/components/Snapshot/SnapshotChoice.js';

interface SnapshotApprovalChoicesProps {
    choices: string[];
    disabled?: boolean;
    onChange?: (value: string[]) => void;
}

export const SnapshotApprovalChoices = memo<SnapshotApprovalChoicesProps>(function SnapshotApprovalChoices({
    choices,
    disabled,
    onChange,
}) {
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

    return (
        <div className="flex flex-col gap-3">
            {choices.map((choice) => {
                return (
                    <SnapshotChoice
                        key={choice}
                        value={choice}
                        selected={selectedChoices.includes(choice)}
                        onClick={(value) => {
                            const result = uniq([...selectedChoices, value]);
                            setSelectedChoices(result);
                            onChange?.(result);
                        }}
                        disabled={disabled}
                    />
                );
            })}
        </div>
    );
});
