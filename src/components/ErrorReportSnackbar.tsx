import { BugAntIcon, ClipboardIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { SnackbarContent, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';

interface ReportCompleteProps {
    id: number | string;
    detail?: string | React.ReactNode;
    message: SnackbarMessage;
}

export const ErrorReportSnackbar = forwardRef<HTMLDivElement, ReportCompleteProps>(function ErrorReportSnackbar(
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

    const title = message;
    const body = detail;

    const githubReportLink = useMemo(() => {
        const url = new URLSearchParams();
        url.set('title', title as string);
        url.set('body', body as string);
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
                    <div className="flex text-white ">
                        <div className="mr-auto flex flex-grow cursor-pointer items-center" onClick={handleExpandClick}>
                            <div className="mr-1 inline-block p-2 text-white">
                                <XCircleIcon className="h-[20px] w-[20px] text-white" />
                            </div>
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={message}>
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
                            <div className="p-4 pt-0">
                                <div className="text-white">{detail}</div>
                            </div>
                        ) : null}
                        <div className="flex px-4 pb-2">
                            <div className="inline-block cursor-pointer text-white" onClick={handleExpandClick}>
                                {expanded ? <Trans>Show less</Trans> : <Trans>Show more</Trans>}
                            </div>
                            <ClickableButton
                                className="ml-auto inline-flex cursor-pointer items-center text-white "
                                onClick={handleCopy}
                            >
                                <ClipboardIcon className="mr-1 h-3 w-3" />
                                {copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                            </ClickableButton>
                            <a
                                className="ml-1 inline-flex cursor-pointer items-center text-white hover:underline"
                                href={githubReportLink}
                                target="_blank"
                            >
                                <BugAntIcon className="mr-1 h-3 w-3" />
                                <Trans>Report</Trans>
                            </a>
                        </div>
                    </div>
                ) : null}
            </div>
        </SnackbarContent>
    );
});
