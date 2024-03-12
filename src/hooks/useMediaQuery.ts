import { useMediaQuery } from 'usehooks-ts';

export function useIsLarge(constraintType: 'min' | 'max' = 'min') {
    return useMediaQuery(`(${constraintType}-width: 1280px)`);
}

export function useIsMedium(constraintType: 'min' | 'max' = 'min') {
    const isMediumMatched = useMediaQuery(`(${constraintType}-width: 990px)`);
    return isMediumMatched;
}

export function useIsSmall(constraintType: 'min' | 'max' = 'min') {
    const isSmallMatched = useMediaQuery(`(${constraintType}-width: 640px)`);
    return isSmallMatched;
}
