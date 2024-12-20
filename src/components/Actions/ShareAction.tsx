import { MenuItem } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import SendIcon from '@/assets/send.svg';
import ShareIcon from '@/assets/share.svg';
import { CopyLinkButton } from '@/components/Actions/CopyLinkButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { ComposeModalRef } from '@/modals/controls.js';

interface ShareActionProps {
    link: string;
}

export const ShareAction = memo(function ShareAction({ link }: ShareActionProps) {
    return (
        <MoreActionMenu
            button={
                <Tooltip content={t`Share`} placement="top">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-lightSecond hover:bg-link/[0.2] hover:text-link"
                    >
                        <ShareIcon width={17} height={16} />
                    </motion.button>
                </Tooltip>
            }
        >
            <MenuGroup>
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            onClick={() => {
                                ComposeModalRef.open({
                                    chars: link,
                                });
                                close();
                            }}
                        >
                            <SendIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Post with link</Trans>
                            </span>
                        </MenuButton>
                    )}
                </MenuItem>
                <MenuItem>{({ close }) => <CopyLinkButton link={link || ''} onClick={close} />}</MenuItem>
            </MenuGroup>
        </MoreActionMenu>
    );
});
