import { MenuItem } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { memo } from 'react';

import CopyIcon from '@/assets/copy.svg';
import MoreIcon from '@/assets/more.svg';
import ReloadIcon from '@/assets/reload.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { useCopyText } from '@/hooks/useCopyText.js';
import type { FrameV2 } from '@/types/frame.js';

interface MoreActionProps {
    frame?: FrameV2;
    disabled?: boolean;
    onReload?: () => void;
}

export const MoreAction = memo(function MoreAction({ frame, disabled = false, onReload }: MoreActionProps) {
    const [, handleCopy] = useCopyText(frame?.x_url ?? '', { enqueueSuccessMessage: true });

    return (
        <MoreActionMenu loginRequired={false} button={<MoreIcon width={24} height={24} className="text-main" />}>
            <MenuGroup>
                {frame?.x_url ? (
                    <MenuItem>
                        {({ close }) => (
                            <MenuButton
                                disabled={disabled}
                                onClick={() => {
                                    close();
                                    handleCopy();
                                }}
                            >
                                <CopyIcon width={18} height={18} />
                                <span className="font-bold leading-[22px] text-main">
                                    <Trans>Copy frame URL</Trans>
                                </span>
                            </MenuButton>
                        )}
                    </MenuItem>
                ) : null}
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
