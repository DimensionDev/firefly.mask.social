import { useCallback, useEffect, useRef, useState } from 'react';

export function useDetectOverflow<T extends HTMLDivElement>(): [overflow: boolean, ref: (node: T | null) => void] {
    const [overflow, setOverflow] = useState(false);
    const resizeObserver = useRef<ResizeObserver>(null);
    const ref = useCallback((node: T | null) => {
        if (!node) return;
        resizeObserver.current?.disconnect();
        resizeObserver.current = new ResizeObserver(() => {
            setOverflow(node.offsetWidth !== node.scrollWidth);
        });
        resizeObserver.current?.observe(node);
    }, []);

    useEffect(() => {
        return () => resizeObserver.current?.disconnect();
    }, []);

    return [overflow, ref];
}
