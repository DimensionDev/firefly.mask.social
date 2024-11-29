'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

interface ActivityContext {
    address: string | undefined;
    name: string;
    onChangeAddress: (address: string) => void;
}

export const ActivityContext = createContext<ActivityContext>({
    address: undefined,
    name: '',
    onChangeAddress() {},
});

export function ActivityProvider({ name, children }: PropsWithChildren<Pick<ActivityContext, 'name'>>) {
    const [address, setAddress] = useState<ActivityContext['address']>(undefined);
    const ctxValue = useMemo(
        () => ({
            address,
            name,
            onChangeAddress: setAddress,
        }),
        [address, name],
    );
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
