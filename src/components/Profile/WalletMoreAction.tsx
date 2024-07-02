import { Menu, type MenuProps, Transition } from '@headlessui/react';
import { EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import { useEnsName } from 'wagmi';

import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { Tips } from '@/components/Tips/index.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    profile: WalletProfile;
    className?: string;
}

export const WalletMoreAction = memo<MoreProps>(function WalletMoreAction({ profile, className, ...rest }) {
    const { data: ens } = useEnsName({ address: profile.address });
    const identity = profile.primary_ens || ens || formatEthereumAddress(profile.address, 4);
    const { data: isMuted } = useIsWalletMuted(profile.address);

    return (
        <Menu className={classNames('relative', className as string)} as="div" {...rest}>
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
            >
                <EllipsisHorizontalCircleIcon width={32} height={32} />
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <Menu.Item>
                        {({ close }) => (
                            <MuteWalletButton
                                identity={identity}
                                isMuted={isMuted}
                                address={profile.address}
                                onClick={close}
                            />
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ close }) => (
                            <div className="px-3 py-1 hover:bg-bg">
                                <Tips
                                    identity={profile.address}
                                    source={Source.Wallet}
                                    handle={(profile.primary_ens || ens) ?? undefined}
                                    tooltipDisabled
                                    label={t`Send tips`}
                                    onClick={close}
                                    pureWallet
                                />
                            </div>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
