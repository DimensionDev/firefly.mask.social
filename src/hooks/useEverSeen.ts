import { type RefObject, useEffect, useRef, useState } from 'react';
import { useIntersection } from 'react-use';

export function useEverSeen<E = HTMLDivElement>(options: IntersectionObserverInit = {}): [boolean, RefObject<E>] {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    const nullRef = useRef(null);
    const entry = useIntersection(seen ? nullRef : ref, options);
    useEffect(() => {
        if (entry?.isIntersecting) setSeen(true);
    }, [entry?.isIntersecting]);

    return [seen, ref];
}
