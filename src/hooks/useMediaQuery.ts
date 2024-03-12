import { useMediaQuery } from 'usehooks-ts';

export function useIsLarge() {
    return useMediaQuery('(min-width: 1280px)');
}

export function useIsMedium(exlusive = false) {
    const isLargeMatched = useIsLarge();
    const isMediumMatched = useMediaQuery('(min-width: 990px)');
    return exlusive ? isMediumMatched && !isLargeMatched : isMediumMatched;
}

export function useIsSmall(exlusive = false) {
    const isLargeMatched = useIsLarge();
    const isMediumMatched = useIsMedium();
    const isSmallMatched = useMediaQuery('(min-width: 640px)');
    return exlusive ? isSmallMatched && !isMediumMatched && !isLargeMatched : isSmallMatched;
}
