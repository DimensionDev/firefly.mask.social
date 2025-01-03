import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { RouterProvider } from '@tanstack/react-router';
import { forwardRef, useCallback } from 'react';

import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { router, TipsRoutePath } from '@/components/Tips/TipsModalRouter.js';
import { Source } from '@/constants/enum.js';
import { TIPS_SUPPORT_NETWORKS } from '@/constants/index.js';
import { enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { TipsContext, type TipsProfile } from '@/hooks/useTipsContext.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { FireflyIdentity, FireflyProfile, Profile, WalletProfile } from '@/providers/types/Firefly.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface TipsModalOpenProps {
    identity: FireflyIdentity;
    profiles: FireflyProfile[];
    handle: string | null;
    pureWallet?: boolean;
    post?: Post;
}

export type TipsModalCloseProps = {} | void;

function formatTipsProfiles(profiles: FireflyProfile[]) {
    const socialProfiles = profiles
        .filter(({ identity }) => identity.source !== Source.Wallet)
        .map(
            (p) =>
                ({
                    platform: p.identity.source.toLowerCase(),
                    handle: p.displayName,
                }) as unknown as Profile,
        );
    const walletProfiles = profiles
        .filter((profile) => {
            const origin = profile.__origin__ as WalletProfile;
            return profile.identity.source === Source.Wallet && TIPS_SUPPORT_NETWORKS.includes(origin.blockchain);
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
    const profile = profiles.find((profile) => isSameEthereumAddress(profile.address, address))
        ?.__origin__ as WalletProfile;
    return profile?.primary_ens ?? formatEthereumAddress(address, 4);
}

const TipsModalUI = forwardRef<SingletonModalRefCreator<TipsModalOpenProps, TipsModalCloseProps>>(
    function TipsModalUI(_, ref) {
        const isSmall = useIsSmall('max');
        const { reset, update } = TipsContext.useContainer();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: async ({ identity, handle, profiles, post, pureWallet = false }) => {
                // avoid UI flicker when closing
                reset();

                try {
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
                            recipientList: walletProfiles,
                            recipient: walletProfiles[0],
                            identity,
                            post: post ?? null,
                            handle:
                                identity.source === Source.Wallet && !handle
                                    ? formatWalletHandle(walletProfiles, identity.id)
                                    : handle,
                            pureWallet,
                            socialProfiles,
                        }));
                        router.navigate({ to: TipsRoutePath.TIPS });
                    }
                } catch (error) {
                    enqueueMessageFromError(error, t`Failed to send tip. Please try again later.`);
                    throw error;
                }
            },
        });
        const onClose = useCallback(() => {
            dispatch?.close({});
        }, [dispatch]);

        if (!isSmall) {
            return (
                <Modal open={open} onClose={onClose} disableScrollLock={false} disableDialogClose>
                    <div className="z-10 w-4/5 rounded-md bg-lightBottom px-3 py-6 text-medium text-lightMain shadow-popover transition-all dark:bg-darkBottom md:w-[485px] md:rounded-xl md:px-6">
                        <RouterProvider router={router} context={{ onClose }} />
                    </div>
                </Modal>
            );
        }

        return (
            <Popover open={open} onClose={onClose} dialogPanelClassName="!p-0 !pt-6">
                <div className="px-3 pb-6 text-medium text-lightMain">
                    <RouterProvider router={router} context={{ onClose }} />
                </div>
            </Popover>
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
