import { memo, type PropsWithChildren } from 'react';

import { useMemorizeAccount } from '@/hooks/useMemorizedAccount.js';

export const MemorizeAccount = memo(function MemorizeAccount({ children }: PropsWithChildren<{}>) {
    useMemorizeAccount();
    return null;
});
