import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import type { Address } from 'viem';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Options {
    identity: string;
    address: Address;
    following: boolean;
}
export function useToggleWatchWallet({ identity, address, following }: Options) {
    const mutation = useMutation({
        mutationFn: async () => {
            try {
                // TODO address is case sensitive by far.
                const addr = address.toLowerCase();
                if (following) {
                    const result = await FireflySocialMediaProvider.unwatchWallet(addr);
                    enqueueSuccessMessage(t`${identity} unwatched`);
                    return result;
                }
                const result = await FireflySocialMediaProvider.watchWallet(addr);
                enqueueSuccessMessage(t`${identity} watched`);
                return result;
            } catch (error) {
                enqueueErrorMessage(following ? t`Failed to unwatch ${identity}` : t`Failed to watch ${identity}`, {
                    error,
                });
                throw error;
            }
        },
    });
    return mutation;
}
