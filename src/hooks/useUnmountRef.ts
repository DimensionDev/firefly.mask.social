import { useEffect, useRef } from 'react';

export function useUnmountRef() {
    const ref = useRef(false);
    useEffect(() => {
        ref.current = false;
        return () => {
            ref.current = true;
        };
    }, []);
    return ref;
}
