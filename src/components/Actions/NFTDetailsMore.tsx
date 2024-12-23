import { MenuItem } from '@headlessui/react';
import { t } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import MoreIcon from '@/assets/more.svg';
import { CopyLinkButton } from '@/components/Actions/CopyLinkButton.js';
import { NFTReportSpamButton } from '@/components/Actions/NFTReportSpamButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { DownloadImageButton } from '@/components/NFTDetail/DownloadImageButton.js';
import { Tooltip } from '@/components/Tooltip.js';

export interface NFTDetailsMoreProps extends HTMLProps<HTMLDivElement> {
    collectionId?: string;
    collectionUrl?: string;
    nftImage?: string;
}

export const NFTDetailsMore = memo<NFTDetailsMoreProps>(function NFTDetailsMore({
    collectionId,
    collectionUrl = '',
    nftImage,
    className,
}) {
    return (
        <MoreActionMenu
            className={className}
            button={
                <Tooltip content={t`More`} placement="top">
                    <MoreIcon width={24} height={24} className="text-secondary" />
                </Tooltip>
            }
        >
            <MenuGroup>
                {collectionId ? (
                    <MenuItem>
                        {({ close }) => <NFTReportSpamButton onClick={close} collectionId={collectionId} />}
                    </MenuItem>
                ) : null}
                {collectionUrl ? (
                    <MenuItem>{({ close }) => <CopyLinkButton link={collectionUrl} onClick={close} />}</MenuItem>
                ) : null}
                {nftImage ? (
                    <MenuItem>{({ close }) => <DownloadImageButton url={nftImage} onClick={close} />}</MenuItem>
                ) : null}
            </MenuGroup>
        </MoreActionMenu>
    );
});
