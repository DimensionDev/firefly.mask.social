import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { SnackbarContent, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef, useCallback, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { useCopyText } from '@/hooks/useCopyText.js';

export interface ErrorReportSnackbarProps {
    id: number | string;
    detail?: string | React.ReactNode;
    message: SnackbarMessage;
}

export const WarnSnackbar = forwardRef<HTMLDivElement, ErrorReportSnackbarProps>(function ErrorReportSnackbar(
    { id, detail, message },
    ref,
) {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = useCallback(() => {
        setExpanded((oldExpanded) => !oldExpanded);
    }, []);

    const handleDismiss = useCallback(() => {
        closeSnackbar(id);
    }, [id, closeSnackbar]);

    const [title, setTitle] = useState(message);
    const [copied, handleCopy] = useCopyText(`${title}\n\n${detail}`, { enqueueSuccessMessage: false });

    return (
        <SnackbarContent ref={ref} className="rounded-[4px] bg-warn">
            <div className="w-full text-sm">
                <div className="p-2 pl-3">
                    <div className="flex max-w-[400px] text-white">
                        <div className="mr-auto flex flex-grow cursor-pointer items-center" onClick={handleExpandClick}>
                            <div className="mr-1 inline-block p-2 text-white">
                                <XCircleIcon className="h-[20px] w-[20px] text-white" />
                            </div>
                            <div
                                className="break-word"
                                ref={(node) => {
                                    // convert jsx to string is too complicated, but in favor of DOM api, it's simple
                                    if (typeof message !== 'object' || !node) return;
                                    setTitle(node.innerText.replaceAll('\n', ' '));
                                }}
                            >
                                {message}
                            </div>
                        </div>
                        <ClickableButton className="p-2" onClick={handleDismiss}>
                            <CloseIcon width={16} height={16} />
                        </ClickableButton>
                    </div>
                </div>
                {detail ? (
                    <div>
                        {expanded ? (
                            <div
                                className="max-h-[90px] max-w-[400px] overflow-auto break-words p-4 pt-0"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                <div className="whitespace-pre-wrap text-sm text-white">{detail}</div>
                            </div>
                        ) : null}
                        <div className="flex px-4 pb-2">
                            <div
                                className="inline-block cursor-pointer text-white underline"
                                onClick={handleExpandClick}
                            >
                                {expanded ? <Trans>Show less</Trans> : <Trans>Show more</Trans>}
                            </div>
                            <ClickableButton
                                className="ml-auto inline-flex cursor-pointer items-center text-white"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <ClipboardDocumentCheckIcon className="mr-1 h-3 w-3" />
                                ) : (
                                    <ClipboardDocumentIcon className="mr-1 h-3 w-3" />
                                )}
                                {copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                            </ClickableButton>
                        </div>
                    </div>
                ) : null}
            </div>
        </SnackbarContent>
    );
});
