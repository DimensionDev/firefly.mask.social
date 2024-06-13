import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { useCallback, useState } from 'react';

export function useStateWithSearchParams<Value extends string>(key: string, initialValue?: Value) {
    const searchParam = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [state, setState] = useState(searchParam.get(key) ?? initialValue);
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
            setState(value);
        },
        [router, searchParam, pathname, key],
    );
    return [state as Value, update] as const;
}
