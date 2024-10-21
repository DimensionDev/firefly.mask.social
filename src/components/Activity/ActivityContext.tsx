'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

interface ActivityContext {
    address: string | null;
    name: string;
    onChangeAddress: (address: string) => void;
}

export const ActivityContext = createContext<ActivityContext>({
    address: null,
    name: '',
    onChangeAddress() {},
});

export function ActivityProvider({ name, children }: PropsWithChildren<Pick<ActivityContext, 'name'>>) {
    const [address, setAddress] = useState<ActivityContext['address']>(null);
    const ctxValue = useMemo(() => ({ address, name, onChangeAddress: setAddress }), [address, name]);
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
