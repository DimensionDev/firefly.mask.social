import { Menu } from '@headlessui/react';
import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import MoreIcon from '@/assets/more.svg';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { NFTReportSpamButton } from '@/components/Actions/NFTReportSpamButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';
import { useNFTDetail } from '@/hooks/useNFTDetail.js';

interface Props {
    /** User address */
    address: Address;
    contractAddress: Address;
    tokenId: string;
    chainId: ChainId;
}
export function NFTMoreAction({ address, contractAddress, tokenId, chainId }: Props) {
    const { data: ens } = useEnsName({ address });
    const identity = ens || formatEthereumAddress(address, 4);
    const { data } = useNFTDetail(contractAddress, tokenId, chainId);
    const collectionId = data?.collection?.id;
    const { data: isMuted } = useIsWalletMuted(address);
    const isMyProfile = useIsMyRelatedProfile(address, Source.Wallet);

    return (
        <MoreActionMenu
            button={
                <Tooltip content={t`More`} placement="top">
                    <MoreIcon width={24} height={24} />
                </Tooltip>
            }
        >
            <Menu.Items
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                {!isMyProfile ? (
                    <>
                        <Menu.Item>
                            {({ close }) => <WatchWalletButton identity={identity} address={address} onClick={close} />}
                        </Menu.Item>
                        <Menu.Item>
                            {({ close }) => (
                                <MuteWalletButton
                                    identity={identity}
                                    address={address}
                                    isMuted={isMuted}
                                    onClick={close}
                                />
                            )}
                        </Menu.Item>
                    </>
                ) : null}
                {collectionId ? (
                    <Menu.Item>
                        {({ close }) => <NFTReportSpamButton onClick={close} collectionId={collectionId} />}
                    </Menu.Item>
                ) : null}
                <Menu.Item>
                    {({ close }) => (
                        <Tips
                            className="px-3 py-1 hover:bg-bg"
                            identity={address}
                            source={Source.Wallet}
                            handle={ens}
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
}
