import { Menu, type MenuProps } from '@headlessui/react';
import { t } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import MoreCircleIcon from '@/assets/more-circle.svg';
import { MuteAllByWallet } from '@/components/Actions/MuteAllProfile.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Source } from '@/constants/enum.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    profile: WalletProfile;
    className?: string;
}

export const WalletMoreAction = memo<MoreProps>(function WalletMoreAction({ profile, className, ...rest }) {
    const { data: ens } = useEnsName({ address: profile.address });
    const { data: isMuted } = useIsWalletMuted(profile.address);

    const identity = useFireflyIdentity(Source.Wallet, profile.address);
    const isMyWallet = useIsMyRelatedProfile(identity.source, identity.id);

    const ensOrAddress = profile.primary_ens || ens || formatAddress(profile.address, 4);

    return (
        <MoreActionMenu button={<MoreCircleIcon width={32} height={32} />} className={className}>
            <Menu.Items
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={stopEvent}
            >
                <Menu.Item>
                    {({ close }) => (
                        <MuteWalletButton
                            handleOrEnsOrAddress={ensOrAddress}
                            isMuted={isMuted}
                            address={profile.address}
                            onClick={close}
                        />
                    )}
                </Menu.Item>
                {!isMyWallet && (
                    <Menu.Item>
                        {({ close }) => (
                            <MuteAllByWallet address={profile.address} handle={ensOrAddress} onClose={close} />
                        )}
                    </Menu.Item>
                )}
                <Menu.Item>
                    {({ close }) => (
                        <Tips
                            className="px-3 py-1 !text-main hover:bg-bg"
                            identity={identity}
                            handle={profile.primary_ens || ens}
                            tooltipDisabled
                            label={t`Send a tip`}
                            onClick={close}
                            pureWallet
                        />
                    )}
                </Menu.Item>
            </Menu.Items>
        </MoreActionMenu>
    );
});
