'use client';

import { createContext, type PropsWithChildren, useMemo, useState } from 'react';

export enum ActivityElex24VoteOption {
    Trump = 'trump',
    Harris = 'harris',
}

interface ActivityElex24ContextValue {
    vote?: ActivityElex24VoteOption;
    setVote: (vote: ActivityElex24VoteOption) => void;
}

export const ActivityElex24Context = createContext<ActivityElex24ContextValue>({
    setVote() {},
});

export function ActivityElex24Provider({ children }: PropsWithChildren) {
    const [vote, setVote] = useState<ActivityElex24VoteOption | undefined>(undefined);
    const ctxValue = useMemo(() => ({ vote, setVote }), [vote]);
    return <ActivityElex24Context.Provider value={ctxValue}>{children}</ActivityElex24Context.Provider>;
}
