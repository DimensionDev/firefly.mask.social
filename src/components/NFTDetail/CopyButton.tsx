'use client';

import { t, Trans } from '@lingui/macro';
import { useCallback, useRef, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import CopyIcon from '@/assets/copy.svg';
import { Tooltip } from '@/components/Tooltip.js';

export function CopyButton(props: { value: string }) {
    const [, copyToClipboard] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const handleCopy = useCallback(() => {
        copyToClipboard(props.value);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(setCopied, 1500, false);
    }, [copyToClipboard, props.value]);

    return (
        <Tooltip content={copied ? t`Copied` : t`Copy`} placement="top" hideOnClick={false} interactive>
            <button
                className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 text-[10px] leading-[14px]"
                onClick={handleCopy}
            >
                <CopyIcon className="h-3 w-3" />
                <Trans>Copy Address</Trans>
            </button>
        </Tooltip>
    );
}
