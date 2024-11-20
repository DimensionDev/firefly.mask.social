import { Trans } from '@lingui/macro';

import { classNames } from '@/helpers/classNames.js';
import { computeVolume } from '@/helpers/polymarket.js';
import type { PolymarketActivity } from '@/providers/types/Firefly.js';

interface ActivityResultProps {
    activity: PolymarketActivity;
}

export function PolymarketActivityResult({ activity }: ActivityResultProps) {
    const isLeft = activity.conditionOutcomePrices[0] === '1';
    const outcome = isLeft ? activity.conditionOutcomes[0] : activity.conditionOutcomes[1];

    return (
        <div className="mt-2 text-center">
            <div
                className={classNames('h-12 rounded-full text-sm font-bold leading-[48px] text-lightBottom', {
                    'bg-success': isLeft,
                    'bg-danger': !isLeft,
                })}
            >
                <Trans>Settled as {outcome.toUpperCase()}</Trans>
            </div>
            <div className="mt-2 text-xs font-medium text-lightSecond">${computeVolume(activity, isLeft ? 0 : 1)}</div>
        </div>
    );
}
