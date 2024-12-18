import MoreIcon from '@/assets/more.svg';
import { motion } from 'framer-motion';
import { CloseButton } from '@/components/CloseButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import type { FrameV2 } from '@/types/frame.js';
import { memo, useState } from 'react';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { MenuItem } from '@headlessui/react';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import SendIcon from '@/assets/send.svg';
import { t, Trans } from '@lingui/macro';

export const MoreAction = memo(function MoreAction() {
    return (
        <MoreActionMenu
            button={
                <Tooltip content={t`Share`} placement="top">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-lightSecond hover:bg-link/[0.2] hover:text-link"
                    >
                        <MoreIcon width={24} height={24} className="text-secondary" />
                    </motion.button>
                </Tooltip>
            }
        >
            <MenuGroup>
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            onClick={() => {
                                close();
                            }}
                        >
                            <SendIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Reload page</Trans>
                            </span>
                        </MenuButton>
                    )}
                </MenuItem>
            </MenuGroup>
        </MoreActionMenu>
    );
});
