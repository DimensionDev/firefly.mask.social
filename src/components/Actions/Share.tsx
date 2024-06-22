import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';

import LinkIcon from '@/assets/link.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';

interface ShareProps {
    url: string;
    disabled?: boolean;
}
export const Share = memo<ShareProps>(function Collect({ url, disabled = false }) {
    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        copyToClipboard(url);
        enqueueSuccessMessage(t`Copied`);
    }, [url, copyToClipboard]);

    return (
        <ClickableArea
            className={classNames('flex flex-auto items-center space-x-2 self-auto justify-self-auto text-main', {
                'opacity-50': disabled,
            })}
        >
            <Tooltip content={t`Share`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (disabled) return;
                        handleClick();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-link/[0.2] hover:text-link"
                >
                    <LinkIcon width={20} height={20} />
                </motion.button>
            </Tooltip>
        </ClickableArea>
    );
});
