import { useEffect, useState } from 'react';

import { stopEvent } from '@/helpers/stopEvent.js';

export function useDisableScrollPassive() {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref) return;
        ref?.addEventListener('touchmove', stopEvent, { passive: false });

        return () => {
            ref?.removeEventListener('touchmove', stopEvent);
        };
    }, [ref]);

    return {
        ref,
        setRef,
    };
}
