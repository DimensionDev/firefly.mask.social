import { BugAntIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { SnackbarContent, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { env } from '@/constants/env.js';

export interface ErrorReportSnackbarProps {
    id: number | string;
    detail?: string | React.ReactNode;
    noReport?: boolean;
    message: SnackbarMessage;
}

export const ErrorReportSnackbar = forwardRef<HTMLDivElement, ErrorReportSnackbarProps>(function ErrorReportSnackbar(
    { id, detail, noReport, message },
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
    const body = detail;

    const githubReportLink = useMemo(() => {
        const url = new URLSearchParams();
        url.set('title', typeof title !== 'object' ? `${title}` : 'Something wrong');
        url.set(
            'body',
            [
                '## Description',
                body as string,
                '## Extra Information',
                `- Version: ${env.shared.VERSION}`,
                `- Environment: ${env.shared.NODE_ENV}`,
                `- Commit Hash: ${env.shared.COMMIT_HASH}`,
                `- UserAgent: ${navigator.userAgent}`,
                `- Timestamp: ${new Date().toISOString()}`,
            ].join('\n'),
        );
        return 'https://github.com/DimensionDev/firefly.mask.social/issues/new?' + url.toString();
    }, [title, body]);

    const text = `${title}\n\n${body}`;

    const [, copyToClipboard] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const handleCopy = useCallback(() => {
        copyToClipboard(text);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(setCopied, 1500, false);
    }, [copyToClipboard, text]);

    return (
        <SnackbarContent ref={ref} className="rounded-[4px] bg-danger">
            <div className="w-full text-sm">
                <div className="p-2 pl-3">
                    <div className="flex max-w-[400px] text-white">
                        <div className="mr-auto flex flex-grow cursor-pointer items-center" onClick={handleExpandClick}>
                            <div className="mr-1 inline-block p-2 text-white">
                                <XCircleIcon className="h-[20px] w-[20px] text-white" />
                            </div>
                            <div
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
                                <div className="whitespace-pre-wrap text-white">{detail}</div>
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
                            {noReport ? null : (
                                <a
                                    className="ml-1 inline-flex cursor-pointer items-center text-white underline"
                                    href={githubReportLink}
                                    target="_blank"
                                >
                                    <BugAntIcon className="mr-1 h-3 w-3" />
                                    <Trans>Report</Trans>
                                </a>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </SnackbarContent>
    );
});
