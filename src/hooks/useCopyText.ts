import { t } from '@lingui/macro';
import { useCallback, useRef, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.jsx';

export function useCopyText(
    text: string,
    options: { enqueueSuccessMessage?: boolean } = { enqueueSuccessMessage: true },
) {
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const [copied, setCopied] = useState(false);
    const [, copyToClipboard] = useCopyToClipboard();

    const handleCopy = useCallback(() => {
        copyToClipboard(text);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(setCopied, 1500, false);
        if (options.enqueueSuccessMessage) enqueueSuccessMessage(t`Copied`);
    }, [text, copyToClipboard]);

    return [copied, handleCopy] as const;
}
