import { Trans } from '@lingui/macro';
import { forwardRef, type HTMLProps } from 'react';

import EyeSlash from '@/assets/eye-slash.svg';
import TrashIcon from '@/assets/trash.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLDivElement> {
    authorMuted?: boolean;
    isQuote: boolean;
    disableIndent: boolean;
}
export const CollapsedContent = forwardRef<HTMLDivElement, Props>(function CollapsedContent(
    { isQuote, authorMuted: muted, ...rest },
    ref,
) {
    return (
        <div {...rest} ref={ref}>
            <div
                className={classNames(
                    'flex items-center gap-1 rounded-lg border-primaryMain  py-[6px] text-[15px]',
                    isQuote ? '' : 'border px-3',
                )}
            >
                {muted ? <EyeSlash width={16} height={16} /> : <TrashIcon width={16} height={16} />}
                {muted ? <Trans>The author is muted by you.</Trans> : <Trans>Post has been deleted</Trans>}
            </div>
        </div>
    );
});
