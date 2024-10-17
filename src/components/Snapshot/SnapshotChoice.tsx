import { memo } from 'react';

import SelectedIcon from '@/assets/selected.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';

interface SnapshotChoiceProps {
    selected?: boolean;
    value: string;
    onClick: (value: string) => void;
    disabled?: boolean;
}

export const SnapshotChoice = memo<SnapshotChoiceProps>(function SnapshotChoice({
    selected = false,
    disabled = false,
    value,
    onClick,
}) {
    return (
        <ClickableArea
            className={classNames('flex items-center justify-between rounded-[10px] border bg-white px-5 py-2', {
                'hover:border-lightHighlight hover:text-lightHighlight': !disabled,
                'border-transparent text-commonMain': !selected,
                'border border-lightHighlight text-lightHighlight': selected,
                'opacity-40': disabled,
            })}
            onClick={() => {
                onClick(value);
            }}
        >
            <span className="text-sm font-bold leading-[18px]">{value}</span>
            {selected ? <SelectedIcon width={24} height={24} /> : null}
        </ClickableArea>
    );
});
