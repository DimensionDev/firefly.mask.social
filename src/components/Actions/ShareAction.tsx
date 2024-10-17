import { Menu, MenuItem, MenuItems } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import LinkIcon from '@/assets/link.svg';
import SendIcon from '@/assets/send.svg';
import ShareIcon from '@/assets/share.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useCopyText } from '@/hooks/useCopyText.js';
import { ComposeModalRef } from '@/modals/controls.js';

interface ShareActionProps {
    link: string;
}

export const ShareAction = memo(function ShareAction({ link }: ShareActionProps) {
    const [, handleCopy] = useCopyText(link ?? '');
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
            <MenuItems
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={stopEvent}
            >
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
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            onClick={() => {
                                handleCopy();
                                close();
                            }}
                        >
                            <LinkIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Copy</Trans>
                            </span>
                        </MenuButton>
                    )}
                </MenuItem>
            </MenuItems>
        </MoreActionMenu>
    );
});
