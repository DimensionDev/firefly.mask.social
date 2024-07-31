import { Menu, type MenuProps } from '@headlessui/react';
import { EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import { MuteAllByWallet } from '@/components/Actions/MuteAllProfile.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Source } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
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

    const isMyWallet = useIsMyRelatedProfile(profile.address, Source.Wallet);

    return (
        <MoreActionMenu button={<EllipsisHorizontalCircleIcon width={32} height={32} />} className={className}>
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
                {!isMyWallet && (
                    <Menu.Item>
                        {({ close }) => <MuteAllByWallet address={profile.address} handle={identity} onClose={close} />}
                    </Menu.Item>
                )}
                <Menu.Item>
                    {({ close }) => (
                        <Tips
                            className="px-3 py-1 hover:bg-bg"
                            identity={profile.address}
                            source={Source.Wallet}
                            handle={profile.primary_ens || ens}
                            tooltipDisabled
                            label={t`Send tips`}
                            onClick={close}
                            pureWallet
                        />
                    )}
                </Menu.Item>
            </Menu.Items>
        </MoreActionMenu>
    );
});
