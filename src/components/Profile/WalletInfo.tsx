'use client';

import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useCallback } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import CopyIcon from '@/assets/copy.svg';
import EnsIcon from '@/assets/ens.svg';
import MiniEnsIcon from '@/assets/ens-16.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { WatchButton } from '@/components/Profile/WatchButton.js';
import { RelatedSourceIcon } from '@/components/RelatedSourceIcon.js';
import { RelationPlatformIcon } from '@/components/RelationPlatformIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';
import { Tippy } from '@/esm/Tippy.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getRelationPlatformUrl } from '@/helpers/getRelationPlatformUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Relation, WalletProfile } from '@/providers/types/Firefly.js';
import { WalletMoreAction } from '@/components/Profile/WalletMoreAction.js';

interface WalletInfoProps {
    profile: WalletProfile;
    relations?: Relation[];
}

export function WalletInfo({ profile, relations }: WalletInfoProps) {
    const isMedium = useIsMedium();
    const [, copyToClipboard] = useCopyToClipboard();
    const handleCopy = useCallback(() => {
        if (!profile.address) return;
        copyToClipboard(profile.address);
        enqueueSuccessMessage(t`Copied`);
    }, [profile.address, copyToClipboard]);

    const identity = profile.primary_ens || formatEthereumAddress(profile.address, 4);

    return (
        <div className="flex gap-3 p-3">
            <Avatar src={profile.avatar} alt="avatar" size={80} className="h-20 w-20 rounded-full" />
            <div className="relative flex flex-1 flex-col">
                <div className="flex flex-col gap-[8px]">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-lightMain">{identity}</span>
                        <WatchButton className="ml-auto" address={profile.address} />
                        <WalletMoreAction profile={profile} />
                    </div>
                    <div className="flex gap-[10px]">
                        {profile.verifiedSources.map((x) => {
                            return (
                                <Tooltip key={x.source} content={t`Verified by ${x.source}`} placement="bottom">
                                    <RelatedSourceIcon source={x.source} size={24} />
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
                                        <RelationPlatformIcon size={24} source={relation.identity.platform} />
                                    )}
                                </Tooltip>
                            );
                        })}
                        {profile.ens.length ? (
                            <Tippy
                                maxWidth={304}
                                className="tippy-card"
                                placement="bottom"
                                duration={200}
                                arrow={false}
                                trigger="mouseenter"
                                hideOnClick
                                interactive
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
                            </Tippy>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-sm leading-[14px] text-secondary">
                        {isMedium ? profile.address : formatEthereumAddress(profile.address, 4)}
                        <ClickableArea onClick={handleCopy}>
                            <CopyIcon width={14} height={14} className="cursor-pointer" />
                        </ClickableArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
