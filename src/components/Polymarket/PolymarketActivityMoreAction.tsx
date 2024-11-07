import { MenuItem } from '@headlessui/react';
import { t } from '@lingui/macro';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import MoreIcon from '@/assets/more.svg';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';

interface Props {
    /** User address */
    address: Address;
}

export function PolymarketActivityMoreAction({ address }: Props) {
    const { data: ens } = useEnsName({ address });
    const { data: isMuted } = useIsWalletMuted(address);

    const identity = useFireflyIdentity(Source.Wallet, address);
    const isMyProfile = useIsMyRelatedProfile(identity.source, identity.id);

    const ensOrAddress = ens || formatEthereumAddress(address, 4);

    return (
        <MoreActionMenu
            className="ml-auto"
            button={
                <Tooltip content={t`More`} placement="top">
                    <MoreIcon width={24} height={24} className="text-secondary" />
                </Tooltip>
            }
        >
            <MenuGroup>
                {!isMyProfile ? (
                    <>
                        <MenuItem>
                            {({ close }) => (
                                <WatchWalletButton
                                    handleOrEnsOrAddress={ensOrAddress}
                                    address={address}
                                    onClick={close}
                                />
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ close }) => (
                                <MuteWalletButton
                                    handleOrEnsOrAddress={ensOrAddress}
                                    address={address}
                                    isMuted={isMuted}
                                    onClick={close}
                                />
                            )}
                        </MenuItem>
                    </>
                ) : null}
                <MenuItem>
                    {({ close }) => (
                        <Tips
                            className="px-3 py-1 !text-main hover:bg-bg"
                            identity={identity}
                            handle={ens}
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
}
