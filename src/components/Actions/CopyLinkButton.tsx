import { Trans } from '@lingui/macro';
import { forwardRef, type HTMLProps } from 'react';
import urlcat from 'urlcat';

import LinkIcon from '@/assets/small-link.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { useCopyText } from '@/hooks/useCopyText.js';

interface CopyLinkButtonProps extends HTMLProps<HTMLButtonElement> {
    link: string;
    onClick?: () => void;
}

export const CopyLinkButton = forwardRef<HTMLButtonElement, CopyLinkButtonProps>(function CopyLinkButton(
    { link, children, onClick },
    ref,
) {
    const url = link.startsWith('http') ? link : urlcat(location.origin, link);
    const [, handleCopy] = useCopyText(url);

    return (
        <MenuButton
            ref={ref}
            onClick={() => {
                handleCopy();
                onClick?.();
            }}
        >
            <LinkIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">{children || <Trans>Copy link</Trans>}</span>
        </MenuButton>
    );
});
