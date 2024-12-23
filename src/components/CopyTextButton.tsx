'use client';

import { t } from '@lingui/macro';
import type { TippyProps } from '@tippyjs/react';
import { type HTMLProps } from 'react';

import CopyIcon from '@/assets/copy.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { useCopyText } from '@/hooks/useCopyText.js';

interface Props extends HTMLProps<HTMLButtonElement> {
    text: string;
    tooltipProps?: Partial<TippyProps>;
    size?: number;
}

export function CopyTextButton({ text, tooltipProps, size = 12, onClick, ...rest }: Props) {
    const [copied, handleCopy] = useCopyText(text, { enqueueSuccessMessage: false });

    return (
        <Tooltip
            content={copied ? t`Copied` : t`Copy`}
            placement="top"
            hideOnClick={false}
            interactive
            {...tooltipProps}
        >
            <button {...rest} type="button" onClick={handleCopy}>
                <CopyIcon width={size} height={size} className="ml-1" />
            </button>
        </Tooltip>
    );
}
