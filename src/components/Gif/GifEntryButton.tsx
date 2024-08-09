import { t } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import { memo } from 'react';

import GifIcon from '@/assets/gif.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface GifEntryButtonProps {
    disabled?: boolean;
}

export const GifEntryButton = memo(function GifEntryButton({ disabled = false }: GifEntryButtonProps) {
    const { history } = useRouter();

    return (
        <Tooltip content={t`GIF`} placement="top" disabled={disabled}>
            <ClickableButton
                className="flex cursor-pointer gap-1 text-main focus:outline-none"
                disabled={disabled}
                onClick={() => history.push('/gif')}
            >
                <GifIcon
                    width={24}
                    height={24}
                    className={classNames('text-main', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                />
            </ClickableButton>
        </Tooltip>
    );
});
