import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import type { Address } from 'viem';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Options {
    handleOrEnsOrAddress: string;
    address: Address;
    following: boolean;
}

export function useToggleWatchWallet({ handleOrEnsOrAddress, address, following }: Options) {
    const mutation = useMutation({
        mutationFn: async () => {
            try {
                // TODO: address is case sensitive by far.
                const addr = address.toLowerCase();

                if (following) {
                    const result = await FireflySocialMediaProvider.unwatchWallet(addr);
                    enqueueSuccessMessage(t`${handleOrEnsOrAddress} unwatched`);
                    return result;
                }
                const result = await FireflySocialMediaProvider.watchWallet(addr);
                enqueueSuccessMessage(t`${handleOrEnsOrAddress} watched`);
                return result;
            } catch (error) {
                enqueueErrorMessage(
                    getSnackbarMessageFromError(
                        error,
                        following
                            ? t`Failed to unwatch ${handleOrEnsOrAddress}.`
                            : t`Failed to watch ${handleOrEnsOrAddress}.`,
                    ),
                    {
                        error,
                    },
                );
                throw error;
            }
        },
    });
    return mutation;
}
