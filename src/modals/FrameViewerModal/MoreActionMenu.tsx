import { MenuItem } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { memo } from 'react';

import MoreIcon from '@/assets/more.svg';
import ReloadIcon from '@/assets/reload.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';

interface MoreActionProps {
    disabled?: boolean;
    onReload?: () => void;
}

export const MoreAction = memo(function MoreAction({ disabled = false, onReload }: MoreActionProps) {
    return (
        <MoreActionMenu loginRequired={false} button={<MoreIcon width={24} height={24} className="text-main" />}>
            <MenuGroup>
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            disabled={disabled}
                            onClick={() => {
                                close();
                                onReload?.();
                            }}
                        >
                            <ReloadIcon width={18} height={18} />
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
