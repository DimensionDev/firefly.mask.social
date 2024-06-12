import { useMemo } from 'react';

export function useSizeStyle(size?: number, props?: React.CSSProperties) {
    return useMemo<React.CSSProperties>(() => {
        return {
            width: size,
            height: size,
            ...props,
        };
    }, [size, props]);
}
