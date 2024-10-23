'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

interface ActivityContext {
    address: string | undefined;
    name: string;
    onChangeAddress: (address: string) => void;
    fireflyAccountId: string | undefined;
    setFireflyAccountId: (fireflyAccountId: string) => void;
}

export const ActivityContext = createContext<ActivityContext>({
    address: undefined,
    fireflyAccountId: undefined,
    name: '',
    onChangeAddress() {},
    setFireflyAccountId() {},
});

export function ActivityProvider({ name, children }: PropsWithChildren<Pick<ActivityContext, 'name'>>) {
    const [address, setAddress] = useState<ActivityContext['address']>(undefined);
    const [fireflyAccountId, setFireflyAccountId] = useState<ActivityContext['fireflyAccountId']>(undefined);
    const ctxValue = useMemo(
        () => ({ address, name, onChangeAddress: setAddress, fireflyAccountId, setFireflyAccountId }),
        [address, fireflyAccountId, name],
    );
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
