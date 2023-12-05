import type { SVGAttributes } from 'react';

interface Props extends SVGAttributes<SVGElement> {
    count: number;
}
export function CountdownCircle({ count, ...rest }: Props) {
    const isGreen = count < 200;
    const isWarning = count > 200 && count < 260;
    const color = isGreen ? 'rgba(61,194,51, 0.2)' : isWarning ? 'rgba(255,177, 0, 0.5)' : 'rgba(255,53,69,0.5)';
    const dasharray = Math.PI * 2 * 70;
    const progress = Math.min(1, count / 280);
    const dashoffset = Math.floor(dasharray * (1 - progress));
    return (
        <svg viewBox="0 0 160 160" {...rest}>
            <circle r="70" cx="80" cy="80" fill="transparent" stroke="rgba(61,194,51,0.2)" stroke-width="12px" />
            <circle
                r="70"
                cx="80"
                cy="80"
                fill="transparent"
                stroke={color}
                stroke-linecap="round"
                stroke-width="12px"
                stroke-dasharray={`${dasharray.toFixed(3)}px`}
                stroke-dashoffset={`${dashoffset}px`}
            />
        </svg>
    );
}
