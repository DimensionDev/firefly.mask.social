import { t } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { RouterProvider } from '@tanstack/react-router';
import { forwardRef, useCallback } from 'react';

import { Modal } from '@/components/Modal.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { Source } from '@/constants/enum.js';
import { TIPS_SUPPORT_NETWORKS } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { TipsContext, type TipsProfile } from '@/hooks/useTipsContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile, Profile, WalletProfile } from '@/providers/types/Firefly.js';

export interface TipsModalOpenProps {
    identity: string;
    source: Source;
    handle: string | null;
    pureWallet?: boolean;
}

export type TipsModalCloseProps = {} | void;

function formatTipsProfiles(profiles: FireflyProfile[]) {
    const socialProfiles = profiles
        .filter((x) => x.source !== Source.Wallet)
        .map(
            (p) =>
                ({
                    platform: p.source.toLowerCase(),
                    handle: p.displayName,
                }) as unknown as Profile,
        );
    const walletProfiles = profiles
        .filter((profile) => {
            const origin = profile.__origin__ as WalletProfile;
            return profile.source === Source.Wallet && TIPS_SUPPORT_NETWORKS.includes(origin.blockchain);
        })
        .map((profile) => {
            const { address, primary_ens, blockchain } = profile.__origin__ as WalletProfile;
            return {
                ...profile,
                displayName: primary_ens || formatEthereumAddress(address, 8),
                address,
                networkType: blockchain,
            };
        });
    return { walletProfiles, socialProfiles };
}

function formatWalletHandle(profiles: TipsProfile[], address: string) {
    const profile = profiles.find((profile) => isSameAddress(profile.address, address))?.__origin__ as WalletProfile;
    return profile?.primary_ens ?? formatEthereumAddress(address, 4);
}

const TipsModalUI = forwardRef<SingletonModalRefCreator<TipsModalOpenProps, TipsModalCloseProps>>(
    function TipsModalUI(_, ref) {
        const { reset, update } = TipsContext.useContainer();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: async ({ identity, source, handle, pureWallet = false }) => {
                try {
                    router.navigate({ to: TipsRoutePath.LOADING, replace: true });
                    const profiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(source, identity);
                    const { walletProfiles, socialProfiles } = formatTipsProfiles(profiles);

                    walletProfiles.sort((a) => {
                        const { primary_ens } = a.__origin__ as WalletProfile;
                        if (primary_ens === handle) return -1;
                        return primary_ens ? -1 : 1;
                    });
                    if (!walletProfiles.length) {
                        router.navigate({ to: TipsRoutePath.NO_AVAILABLE_WALLET });
                    } else {
                        update((prev) => ({
                            ...prev,
                            receiverList: walletProfiles,
                            receiver: walletProfiles[0],
                            handle:
                                source === Source.Wallet && !handle
                                    ? formatWalletHandle(walletProfiles, identity)
                                    : handle,
                            pureWallet,
                            socialProfiles,
                        }));
                        router.navigate({ to: TipsRoutePath.TIPS });
                    }
                } catch (error) {
                    enqueueErrorMessage(
                        getSnackbarMessageFromError(error, t`Failed to send tips, please try again later.`),
                        { error },
                    );
                    throw error;
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
