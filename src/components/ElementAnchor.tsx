import { type HTMLProps, memo, useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

interface ElementAnchorProps extends HTMLProps<HTMLDivElement> {
    callback: (intersection: IntersectionObserverEntry | undefined) => void;
}

export const ElementAnchor = memo<ElementAnchorProps>(function ElementAnchor({ callback, children, ...rest }) {
    const elementRef = useRef<HTMLDivElement>(null!);
    const intersection = useIntersection(elementRef, {
        rootMargin: '200px',
    });

    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    useEffect(() => {
        if (!intersection?.isIntersecting) return;
        callbackRef.current(intersection);
    }, [intersection]);

    return (
        <div className="flex flex-row items-center justify-center pt-2" ref={elementRef} {...rest}>
            {children}
        </div>
    );
});
