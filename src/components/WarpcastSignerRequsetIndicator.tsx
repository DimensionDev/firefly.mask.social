import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useUnmount } from 'react-use';

import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';

interface WarpcastSignerRequsetIndicatorProps {
    token: string;
}

export function WarpcastSignerRequsetIndicator({ token }: WarpcastSignerRequsetIndicatorProps) {
    const controllerRef = useRef<AbortController>();

    useUnmount(() => {
        controllerRef.current?.abort();
    });

    const { isLoading } = useQuery({
        queryKey: ['signerRequest', token],
        enabled: !!token,
        queryFn: async () => {
            controllerRef.current?.abort();
            controllerRef.current = new AbortController();

            return waitForSignedKeyRequest(controllerRef.current.signal)(token, 'completed');
        },
    });

    if (isLoading) return <div className=" h-[10px] w-[10px] bg-main" />;

    return null;
}
