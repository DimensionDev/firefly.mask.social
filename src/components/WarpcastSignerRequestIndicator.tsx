import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useUnmount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { Session } from '@/providers/types/Session.js';

interface WarpcastSignerRequestIndicatorProps {
    session: Session | null;
    children?: React.ReactNode;
}

export function WarpcastSignerRequestIndicator({ session, children }: WarpcastSignerRequestIndicatorProps) {
    const token = FarcasterSession.isGrantByPermission(session) ? session.signerRequestToken : null;
    const controllerRef = useRef<AbortController>();

    useUnmount(() => {
        controllerRef.current?.abort();
    });

    const { isLoading, error, refetch } = useQuery({
        queryKey: ['signerRequest', token],
        enabled: !!token,
        queryFn: async () => {
            if (!token) return false;

            controllerRef.current?.abort();
            controllerRef.current = new AbortController();

            // 3 * 10 seconds timeout
            return waitForSignedKeyRequest(controllerRef.current.signal)(token, ['completed'], 10);
        },
    });

    if (isLoading)
        return (
            <Tooltip content={t`Querying the signed key state.`} placement="top">
                <LoadingIcon className="animate-spin cursor-pointer" width={24} height={24} />
            </Tooltip>
        );

    if (error) {
        return (
            <Tooltip content={t`Failed to query the signed key state.`} placement="top">
                <ExclamationCircleIcon className=" cursor-pointer" width={24} height={24} onClick={() => refetch()} />
            </Tooltip>
        );
    }

    return children;
}
