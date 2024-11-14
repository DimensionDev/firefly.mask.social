import type { SVGAttributes } from 'react';

import { measureChars } from '@/helpers/chars.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';

interface Props extends SVGAttributes<SVGElement> {}

export function CountdownCircle(props: Props) {
    const post = useCompositePost();
    const { usedLength, availableLength } = measureChars(post);
    const safeLength = Math.floor(availableLength * 0.8);
    const dangerLength = Math.floor(availableLength * 0.9);

    const isGreen = usedLength < safeLength;
    const isWarning = usedLength > safeLength && usedLength < dangerLength;
    const color = isGreen ? 'rgba(61, 194, 51, 0.5)' : isWarning ? 'rgba(255, 177, 0, 0.5)' : 'rgba(255, 53, 69, 0.5)';
    const dasharray = Math.PI * 2 * 70;
    const progress = Math.min(1, usedLength / availableLength);
    const dashoffset = Math.floor(dasharray * (1 - progress));

    return (
        <svg viewBox="0 0 160 160" {...props}>
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
