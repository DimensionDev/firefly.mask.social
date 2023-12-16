import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useUnmount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';
import type { Session } from '@/providers/types/Session.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

interface WarpcastSignerRequestIndicatorProps {
    session: Session | null;
    children?: React.ReactNode;
}

export function WarpcastSignerRequestIndicator({ session, children }: WarpcastSignerRequestIndicatorProps) {
    const token = WarpcastSession.isGrantByPermission(session) ? session.signerRequestToken : null;
    const controllerRef = useRef<AbortController>();

    useUnmount(() => {
        controllerRef.current?.abort();
    });

    const { isLoading } = useQuery({
        queryKey: ['signerRequest', token],
        enabled: !!token,
        queryFn: async () => {
            if (!token) return false;

            controllerRef.current?.abort();
            controllerRef.current = new AbortController();
            return waitForSignedKeyRequest(controllerRef.current.signal)(token, ['completed']);
        },
    });

    if (isLoading)
        return (
            <Tooltip content={t`Querying the signer request state.`} placement="top">
                <LoadingIcon className="animate-spin cursor-pointer" width={24} height={24} />
            </Tooltip>
        );

    return children;
}
