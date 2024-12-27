'use client';

import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';

import MiniEnsIcon from '@/assets/ens-16.svg';
import EnsIcon from '@/assets/ens.svg';
import FireflyLogo from '@/assets/firefly.round.svg';
import LinkIcon from '@/assets/link-square.svg';
import { Avatar } from '@/components/Avatar.js';
import { CopyTextButton } from '@/components/CopyTextButton.js';
import { Image } from '@/components/Image.js';
import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { Link } from '@/components/Link.js';
import { WalletActions } from '@/components/Profile/WalletActions.js';
import { RelatedSourceIcon } from '@/components/RelatedSourceIcon.js';
import { RelationPlatformIcon } from '@/components/RelationPlatformIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { NetworkType, Source } from '@/constants/enum.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { getAddressType } from '@/helpers/getAddressType.js';
import { getRelationPlatformUrl } from '@/helpers/getRelationPlatformUrl.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { isMPCWallet } from '@/helpers/isMPCWallet.js';
import { resolveNetworkIcon } from '@/helpers/resolveNetworkIcon.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { BlockScanExplorerResolver } from '@/providers/ethereum/ExplorerResolver.js';
import { type Relation, type WalletProfile } from '@/providers/types/Firefly.js';

interface WalletInfoProps {
    profile: WalletProfile;
    relations?: Relation[];
}

export function WalletInfo({ profile, relations }: WalletInfoProps) {
    const isMedium = useIsMedium();
    const isDarkMode = useIsDarkMode();

    const avatar = profile.avatar ?? getStampAvatarByProfileId(Source.Wallet, profile.address);
    const networkType = getAddressType(profile.address);

    const addressLink =
        networkType === NetworkType.Ethereum
            ? BlockScanExplorerResolver.addressLink(ChainId.Mainnet, profile.address)
            : null;
    const networkIcon = networkType ? resolveNetworkIcon(networkType, isDarkMode) : null;

    const isMPC = isMPCWallet(profile);
    const displayName = isMPC ? t`Firefly Wallet` : profile.primary_ens || formatAddress(profile.address, 4);

    return (
        <div className="flex gap-3 p-3">
            <Avatar src={avatar} alt="avatar" size={80} className="h-20 w-20 rounded-full" />
            <div className="relative flex flex-1 flex-col">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                        {isMPC ? <FireflyLogo width={19} height={19} /> : null}
                        {networkIcon && networkType ? (
                            <Image src={networkIcon} alt={networkType} width={18} height={18} />
                        ) : null}
                        <span className="text-xl font-black leading-[26px] text-lightMain">{displayName}</span>
                        {networkType === NetworkType.Ethereum ? <WalletActions profile={profile} /> : null}
                    </div>
                    <div className="flex gap-[10px]">
                        {profile.verifiedSources.map((x) => {
                            return (
                                <Tooltip key={x.source} content={t`Verified by ${x.source}`} placement="bottom">
                                    <span>
                                        <RelatedSourceIcon source={x.source} size={24} />
                                    </span>
                                </Tooltip>
                            );
                        })}
                        {relations?.map((relation) => {
                            const url = getRelationPlatformUrl(relation.identity.platform, relation.identity.identity);
                            return (
                                <Tooltip
                                    key={relation.identity.uuid}
                                    content={relation.identity.displayName}
                                    placement="bottom"
                                >
                                    {url ? (
                                        <Link href={url} target="_blank" rel="noreferrer noopener">
                                            <RelationPlatformIcon size={24} source={relation.identity.platform} />
                                        </Link>
                                    ) : (
                                        <span>
                                            <RelationPlatformIcon size={24} source={relation.identity.platform} />
                                        </span>
                                    )}
                                </Tooltip>
                            );
                        })}
                        {profile.ens?.length ? (
                            <InteractiveTippy
                                maxWidth={304}
                                className="tippy-card"
                                placement="bottom"
                                content={
                                    <div className="no-scrollbar flex max-h-[100px] flex-wrap gap-x-[15px] overflow-auto rounded-2xl border-[0.5px] border-secondaryLine bg-primaryBottom p-3">
                                        {profile.ens.map((ens) => {
                                            return (
                                                <div className="flex items-center gap-[5px]" key={ens}>
                                                    <MiniEnsIcon width={16} height={16} />
                                                    <span className="text-[10px] font-bold leading-4 text-main">
                                                        {ens}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                }
                            >
                                <span>
                                    <EnsIcon width={24} height={24} />
                                </span>
                            </InteractiveTippy>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-sm leading-[14px] text-secondary">
                        {isMedium ? profile.address : formatAddress(profile.address, 4)}
                        <CopyTextButton text={profile.address} />
                        {addressLink ? (
                            <Link target="_blank" href={addressLink}>
                                <LinkIcon width={14} height={14} />
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
