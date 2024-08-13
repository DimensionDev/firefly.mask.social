'use client';

import { t } from '@lingui/macro';
import { type HTMLProps } from 'react';

import CopyIcon from '@/assets/copy.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { useCopyText } from '@/hooks/useCopyText.js';

interface Props extends HTMLProps<HTMLButtonElement> {
    value: string;
}

export function CopyButton({ value, onClick, ...rest }: Props) {
    const [copied, handleCopy] = useCopyText(value, { enqueueSuccessMessage: false });

    return (
        <Tooltip content={copied ? t`Copied` : t`Copy`} placement="top" hideOnClick={false} interactive>
            <button {...rest} type="button" onClick={handleCopy}>
                <CopyIcon className="ml-1 h-3 w-3" />
            </button>
        </Tooltip>
    );
}
