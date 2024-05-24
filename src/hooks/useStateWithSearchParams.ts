import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback } from 'react';

export function useStateWithSearchParams<Value extends string>(key: string, initialValue?: Value) {
    const searchParam = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const state = searchParam.get(key) ?? initialValue;
    const update = useCallback(
        (
            value: Value,
            {
                replace = true,
            }: {
                replace?: boolean;
            } = {},
        ) => {
            const urlSearchParams = new URLSearchParams(searchParam.toString());
            urlSearchParams.set(key, value);
            const href = `${pathname}?${urlSearchParams.toString()}`;
            if (replace) {
                router.replace(href);
            } else {
                router.push(href);
            }
        },
        [router.replace, pathname],
    );
    return [state as Value, update] as const;
}
