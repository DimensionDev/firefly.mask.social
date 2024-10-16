import { memo } from 'react';

import MinusIcon from '@/assets/snapshot/minus.svg';
import PlusIcon from '@/assets/snapshot/plus.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';

export type QuadraticChoice = {
    label: string;
    quantity: number;
};

interface SnapshotQuadraticChoiceProps {
    choice: QuadraticChoice;
    disabled?: boolean;
    onChange: (value: QuadraticChoice) => void;
    total: number;
}

export const SnapshotQuadraticChoice = memo<SnapshotQuadraticChoiceProps>(function SnapshotQuadraticChoice({
    choice,
    disabled = false,
    total,
    onChange,
}) {
    const percentage = total ? (choice.quantity / total) * 100 : 0;

    return (
        <ClickableArea
            className={classNames(
                'flex items-center justify-between rounded-[10px] border bg-white px-5 py-2 hover:border-lightHighlight',
                {
                    'border-transparent text-commonMain': !choice.quantity,
                    'border border-lightHighlight text-lightHighlight': !!choice.quantity,
                    'opacity-40': disabled,
                },
            )}
        >
            <span className="text-sm font-bold leading-[18px]">{choice.label}</span>

            <div className="flex items-center gap-[6px]">
                <div
                    className={classNames('flex min-w-[100px] items-center justify-between rounded-full', {
                        'bg-bg03': !choice.quantity,
                        'bg-lightHighlight bg-opacity-20': !!choice.quantity,
                    })}
                >
                    <div
                        className={classNames('flex h-6 w-6 items-center justify-center rounded-full', {
                            'bg-bg02 opacity-40': !choice.quantity,
                            'bg-lightHighlight bg-opacity-20': !!choice.quantity,
                        })}
                        onClick={() => {
                            if (!choice.quantity) return;
                            onChange({
                                ...choice,
                                quantity: choice.quantity - 1,
                            });
                        }}
                    >
                        <MinusIcon />
                    </div>
                    <span className="font-bold">{choice.quantity}</span>
                    <div
                        className={classNames('flex h-6 w-6 items-center justify-center rounded-full', {
                            'bg-bg02': !choice.quantity,
                            'bg-lightHighlight bg-opacity-20': !!choice.quantity,
                        })}
                        onClick={() => {
                            onChange({
                                ...choice,
                                quantity: choice.quantity + 1,
                            });
                        }}
                    >
                        <PlusIcon />
                    </div>
                </div>
                <div className="w-10 text-right text-sm font-bold leading-[18px]">{Math.round(percentage)}%</div>
            </div>
        </ClickableArea>
    );
});
