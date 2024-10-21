import { MenuItem, type MenuProps } from '@headlessui/react';
import { t } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import MoreCircleIcon from '@/assets/more-circle.svg';
import { MuteAllByWallet } from '@/components/Actions/MuteAllProfile.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { MenuGroup } from '@/components/MenuGroup.jsx';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Source } from '@/constants/enum.js';
import { formatAddress } from '@/helpers/formatAddress.js';
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
            <MenuGroup>
                <MenuItem>
                    {({ close }) => (
                        <MuteWalletButton
                            handleOrEnsOrAddress={ensOrAddress}
                            isMuted={isMuted}
                            address={profile.address}
                            onClick={close}
                        />
                    )}
                </MenuItem>
                {!isMyWallet && (
                    <MenuItem>
                        {({ close }) => (
                            <MuteAllByWallet address={profile.address} handle={ensOrAddress} onClose={close} />
                        )}
                    </MenuItem>
                )}
                <MenuItem>
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
                </MenuItem>
            </MenuGroup>
        </MoreActionMenu>
    );
});
