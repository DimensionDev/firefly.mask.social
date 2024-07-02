import { t } from '@lingui/macro';
import { delay } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { RouterProvider } from '@tanstack/react-router';
import { forwardRef, useCallback } from 'react';
import { useAccount } from 'wagmi';

import { Modal } from '@/components/Modal.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { Source } from '@/constants/enum.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { TipsContext, type TipsProfile } from '@/hooks/useTipsContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile, WalletProfile } from '@/providers/types/Firefly.js';

export interface TipsModalOpenProps {
    identity: string;
    source: Source;
    handle: string | null;
    pureWallet?: boolean;
}

export type TipsModalCloseProps = {} | void;

function formatDisplayName(address: string, handle: string | null) {
    return handle ? `${handle}(${formatEthereumAddress(address, 4)})` : formatEthereumAddress(address, 8);
}

const TipsModalUI = forwardRef<SingletonModalRefCreator<TipsModalOpenProps, TipsModalCloseProps>>(
    function TipsModalUI(_, ref) {
        const { reset, update } = TipsContext.useContainer();
        const account = useAccount();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: async ({ identity, source, handle, pureWallet = false }) => {
                try {
                    let receiverList: TipsProfile[] = [];
                    let socialProfiles: Profile[] = [];
                    router.navigate({ to: TipsRoutePath.LOADING, replace: true });
                    if (!pureWallet) {
                        const profiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(
                            identity,
                            source,
                        );
                        socialProfiles = profiles
                            .filter((x) => x.source !== Source.Wallet)
                            .map(
                                (p) =>
                                    ({
                                        platform: p.source.toLowerCase(),
                                        handle: p.displayName,
                                    }) as unknown as Profile,
                            );
                        receiverList = profiles
                            .filter((profile) => profile.source === Source.Wallet)
                            .map((profile) => {
                                const { address, primary_ens } = profile.__origin__ as WalletProfile;
                                return {
                                    ...profile,
                                    displayName: formatDisplayName(address, primary_ens),
                                    address,
                                };
                            });
                        receiverList.sort((a) => {
                            const { primary_ens } = a.__origin__ as WalletProfile;
                            if (primary_ens === handle) return -1;
                            return primary_ens ? -1 : 1;
                        });
                    } else {
                        receiverList = [
                            {
                                identity,
                                source,
                                address: identity as `0x${string}`,
                                __origin__: null,
                                displayName: formatDisplayName(identity, handle),
                            },
                        ];
                        await delay(500);
                    }
                    if (account.isConnected) {
                        await connectMaskWithWagmi();
                    }
                    if (!receiverList.length) {
                        router.navigate({ to: TipsRoutePath.NO_AVAILABLE_WALLET });
                    } else {
                        update((prev) => ({
                            ...prev,
                            receiverList,
                            receiver: receiverList[0],
                            handle: source === Source.Wallet && !handle ? formatEthereumAddress(identity, 4) : handle,
                            pureWallet,
                            socialProfiles,
                        }));
                        router.navigate({ to: TipsRoutePath.TIPS });
                    }
                } catch (error) {
                    enqueueErrorMessage(
                        error instanceof Error ? error.message : t`Starting Tips failed, please try again later`,
                        { error },
                    );
                }
            },
            onClose: () => {
                reset();
            },
        });
        const onClose = useCallback(() => {
            dispatch?.close({});
        }, [dispatch]);

        return (
            <Modal open={open} onClose={onClose} disableScrollLock={false} disableDialogClose>
                <div className="z-10 w-4/5 rounded-md bg-lightBottom px-3 py-6 text-[15px] text-lightMain shadow-popover transition-all dark:bg-darkBottom md:w-[485px] md:rounded-xl md:px-6">
                    <RouterProvider router={router} context={{ onClose }} />
                </div>
            </Modal>
        );
    },
);

export const TipsModal = forwardRef<SingletonModalRefCreator<TipsModalOpenProps, TipsModalCloseProps>>(
    function TipsModal(props, ref) {
        return (
            <TipsContext.Provider>
                <TipsModalUI {...props} ref={ref} />
            </TipsContext.Provider>
        );
    },
);
