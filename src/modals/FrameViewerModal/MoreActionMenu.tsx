import { MenuItem } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { memo } from 'react';

import SendIcon from '@/assets/send.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MoreButton } from '@/components/IconButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';

export const MoreAction = memo(function MoreAction() {
    return (
        <MoreActionMenu loginRequired={false} button={<MoreButton />}>
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
