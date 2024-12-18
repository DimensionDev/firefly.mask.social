import { memo } from 'react';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { MenuItem } from '@headlessui/react';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import SendIcon from '@/assets/send.svg';
import { Trans } from '@lingui/macro';
import { MoreButton } from '@/components/IconButton.js';

export const MoreAction = memo(function MoreAction() {
    return (
        <MoreActionMenu button={<MoreButton />}>
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
