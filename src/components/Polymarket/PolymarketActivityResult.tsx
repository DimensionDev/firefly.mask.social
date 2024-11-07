import { Trans } from '@lingui/macro';

import { classNames } from '@/helpers/classNames.js';
import { computeVolume } from '@/helpers/polymarket.js';
import type { PolymarketActivity } from '@/providers/types/Firefly.js';

interface ActivityResultProps {
    activity: PolymarketActivity;
}

export function PolymarketActivityResult({ activity }: ActivityResultProps) {
    const isYes = activity.outcome.toUpperCase() === 'YES';

    return (
        <div className="mt-2 text-center">
            <div
                className={classNames('h-12 rounded-full text-sm font-bold leading-[48px] text-lightBottom', {
                    'bg-success': isYes,
                    'bg-danger': !isYes,
                })}
            >
                <Trans>Settled as {activity.outcome.toUpperCase()}</Trans>
            </div>
            <div className="mt-2 text-xs font-medium text-lightSecond">
                ${computeVolume(activity, activity.outcomeIndex)}
            </div>
        </div>
    );
}
