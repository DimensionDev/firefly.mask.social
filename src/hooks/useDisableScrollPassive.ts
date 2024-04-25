import { useEffect, useState } from 'react';

export function useDisableScrollPassive() {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref) return;
        const handler = (event: TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };
        ref?.addEventListener('touchmove', handler, { passive: false });

        return () => {
            ref?.removeEventListener('touchmove', handler);
        };
    }, [ref]);

    return {
        ref,
        setRef,
    };
}
