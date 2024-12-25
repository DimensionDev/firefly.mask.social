import { MenuItem } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import MoreIcon from '@/assets/more-circle.svg';
import ShareIcon from '@/assets/share.svg';
import { CopyLinkButton } from '@/components/Actions/CopyLinkButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { NFTReportSpamButton } from '@/components/Actions/NFTReportSpamButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { openWindow } from '@/helpers/openWindow.js';
import { resolveNftUrlByCollection } from '@/helpers/resolveNftUrl.js';
import { ConfirmLeavingModalRef } from '@/modals/controls.js';

export interface CollectionMoreProps extends HTMLProps<HTMLDivElement> {
    collectionId?: string;
    externalUrl?: string;
}

export const CollectionMore = memo<CollectionMoreProps>(function CollectionMore({
    collectionId,
    externalUrl,
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
                    <>
                        <MenuItem>
                            {({ close }) => <NFTReportSpamButton onClick={close} collectionId={collectionId} />}
                        </MenuItem>
                        <MenuItem>
                            {({ close }) => (
                                <CopyLinkButton link={resolveNftUrlByCollection(collectionId)} onClick={close} />
                            )}
                        </MenuItem>
                    </>
                ) : null}
                {externalUrl ? (
                    <MenuItem>
                        <MenuButton
                            onClick={async () => {
                                if (await ConfirmLeavingModalRef.openAndWaitForClose(externalUrl)) {
                                    openWindow(externalUrl, '_blank');
                                }
                            }}
                        >
                            <ShareIcon width={18} height={18} />
                            <span className="font-bold leading-[22px]">
                                <Trans>View on website</Trans>
                            </span>
                        </MenuButton>
                    </MenuItem>
                ) : null}
            </MenuGroup>
        </MoreActionMenu>
    );
});
