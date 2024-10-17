'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

interface ActivityContext {
    address: string | null;
    onChangeAddress: (address: string) => void;
}

export const ActivityContext = createContext<ActivityContext>({
    address: null,
    onChangeAddress() {},
});

export function ActivityProvider({ children }: PropsWithChildren) {
    const [address, setAddress] = useState<ActivityContext['address']>(null);
    const ctxValue = useMemo(() => ({ address, onChangeAddress: setAddress }), [address]);
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
