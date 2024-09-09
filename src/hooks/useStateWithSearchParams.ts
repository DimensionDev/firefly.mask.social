import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback, useState } from 'react';

export function useStateWithSearchParams<Value>(key: string, initialValue: Value) {
    const searchParam = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [state, setState] = useState((searchParam.get(key) ?? initialValue) as Value);
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
            urlSearchParams.set(key, value as string);
            const href = `${pathname}?${urlSearchParams.toString()}`;
            if (replace) {
                router.replace(href);
            } else {
                router.push(href);
            }
            setState(value);
        },
        [router, searchParam, pathname, key],
    );
    return [state, update] as const;
}
