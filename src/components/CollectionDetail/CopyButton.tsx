'use client';

import { t } from '@lingui/macro';
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
            <button onClick={handleCopy}>
                <CopyIcon className="ml-1.5 h-3 w-3 text-secondary" />
            </button>
        </Tooltip>
    );
}
