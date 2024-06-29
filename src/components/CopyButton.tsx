'use client';

import { t } from '@lingui/macro';
import { type HTMLProps, type MouseEvent, useCallback, useRef, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import CopyIcon from '@/assets/copy.svg';
import { Tooltip } from '@/components/Tooltip.js';

interface Props extends HTMLProps<HTMLButtonElement> {
    value: string;
}

export function CopyButton({ value, onClick, ...rest }: Props) {
    const [, copyToClipboard] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const handleCopy = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            copyToClipboard(value);
            setCopied(true);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(setCopied, 1500, false);
            onClick?.(event);
        },
        [copyToClipboard, onClick, value],
    );

    return (
        <Tooltip content={copied ? t`Copied` : t`Copy`} placement="top" hideOnClick={false} interactive>
            <button {...rest} type="button" onClick={handleCopy}>
                <CopyIcon className="ml-1 h-3 w-3" />
            </button>
        </Tooltip>
    );
}
