import { memo, useState } from 'react';

import { SnapshotChoice } from '@/components/Snapshot/SnapshotChoice.js';

interface SnapshotSingleChoicesProps {
    choices: string[];
    disabled?: boolean;
    onChange?: (value: string) => void;
}

export const SnapshotSingleChoices = memo<SnapshotSingleChoicesProps>(function SnapshotSingleChoices({
    choices,
    disabled = false,
    onChange,
}) {
    const [selected, setSelected] = useState<string>();
    return (
        <div className="flex flex-col gap-3">
            {choices.map((choice) => {
                return (
                    <SnapshotChoice
                        key={choice}
                        value={choice}
                        selected={selected === choice}
                        onClick={(value) => {
                            setSelected(value);
                            onChange?.(value);
                        }}
                        disabled={disabled}
                    />
                );
            })}
        </div>
    );
});
