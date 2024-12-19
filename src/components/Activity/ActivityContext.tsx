'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

interface ActivityContext {
    address: string | undefined;
    premiumAddress: string | undefined;
    name: string;
    onChangeAddress: (address: string) => void;
    onChangePremiumAddress: (address: string) => void;
}

export const ActivityContext = createContext<ActivityContext>({
    address: undefined,
    premiumAddress: undefined,
    name: '',
    onChangeAddress() {},
    onChangePremiumAddress() {},
});

export function ActivityProvider({ name, children }: PropsWithChildren<Pick<ActivityContext, 'name'>>) {
    const [address, setAddress] = useState<ActivityContext['address']>(undefined);
    const [premiumAddress, setPremiumAddress] = useState<ActivityContext['address']>(undefined);
    const ctxValue = useMemo(
        () => ({
            address,
            premiumAddress,
            name,
            onChangeAddress: setAddress,
            onChangePremiumAddress: setPremiumAddress,
        }),
        [address, name, premiumAddress],
    );
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
