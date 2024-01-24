import type { SVGAttributes } from 'react';

import { DANGER_POST_SIZE, MAX_POST_SIZE, SAFE_POST_SIZE } from '@/constants/index.js';

interface Props extends SVGAttributes<SVGElement> {
    count: number;
}

export function CountdownCircle({ count, ...rest }: Props) {
    const isGreen = count < SAFE_POST_SIZE;
    const isWarning = count > SAFE_POST_SIZE && count < DANGER_POST_SIZE;
    const color = isGreen ? 'rgba(61, 194, 51, 0.5)' : isWarning ? 'rgba(255, 177, 0, 0.5)' : 'rgba(255, 53, 69, 0.5)';
    const dasharray = Math.PI * 2 * 70;
    const progress = Math.min(1, count / MAX_POST_SIZE);
    const dashoffset = Math.floor(dasharray * (1 - progress));
    return (
        <svg viewBox="0 0 160 160" {...rest}>
            <circle r="70" cx="80" cy="80" fill="transparent" stroke="rgba(61,194,51,0.2)" strokeWidth="15px" />
            <circle
                r="70"
                cx="80"
                cy="80"
                fill="transparent"
                stroke={color}
                strokeLinecap="round"
                strokeWidth="12px"
                strokeDasharray={`${dasharray.toFixed(3)}px`}
                strokeDashoffset={`${dashoffset}px`}
            />
        </svg>
    );
}
