import { t } from '@lingui/macro';
import React, { forwardRef } from 'react';

import type { FrameInput } from '@/types/frame.js';

interface Props {
    input: FrameInput;
}

export const Input = forwardRef<HTMLInputElement, Props>(function FrameInput({ input }: Props, ref) {
    return (
        <input
            ref={ref}
            className="w-full rounded-md border border-line bg-white px-2 py-1.5 dark:bg-darkBottom dark:text-white"
            type="text"
            autoComplete="off"
            spellCheck="false"
            placeholder={input.label || t`Type something here...`}
        />
    );
});
