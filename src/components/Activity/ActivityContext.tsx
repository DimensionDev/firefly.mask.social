'use client';

import { createContext, type PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';

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
    const setFireflyAccountIdCallback = useCallback(
        (id: string) => {
            if (fireflyAccountId === id) return;
            setFireflyAccountId(id);
            captureActivityEvent(EventId.EVENT_X_LOG_IN_SUCCESS, {
                firefly_account_id: id,
            });
        },
        [fireflyAccountId],
    );
    const ctxValue = useMemo(
        () => ({
            address,
            name,
            onChangeAddress: setAddress,
            fireflyAccountId,
            setFireflyAccountId: setFireflyAccountIdCallback,
        }),
        [address, fireflyAccountId, name, setFireflyAccountIdCallback],
    );
    return <ActivityContext.Provider value={ctxValue}>{children}</ActivityContext.Provider>;
}
