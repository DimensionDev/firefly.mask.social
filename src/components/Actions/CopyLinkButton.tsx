import { Trans } from '@lingui/macro';
import type { HTMLProps } from 'react';
import urlcat from 'urlcat';

import LinkIcon from '@/assets/small-link.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { useCopyText } from '@/hooks/useCopyText.js';

interface CopyLinkButtonProps extends HTMLProps<HTMLButtonElement> {
    link: string;
    onClick?: () => void;
}

export function CopyLinkButton({ link, children, onClick }: CopyLinkButtonProps) {
    const url = link.startsWith('http') ? link : urlcat(location.origin, link);
    const [, handleCopy] = useCopyText(url);

    return (
        <MenuButton
            onClick={() => {
                handleCopy();
                onClick?.();
            }}
        >
            <LinkIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">{children || <Trans>Copy link</Trans>}</span>
        </MenuButton>
    );
}
