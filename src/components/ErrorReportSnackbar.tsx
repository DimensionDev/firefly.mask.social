import { BugAntIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { SnackbarContent, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef, useCallback, useMemo, useState } from 'react';

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

    return (
        <SnackbarContent ref={ref} className="rounded-[4px] bg-danger">
            <div className="w-full text-sm">
                <div className="p-2 pl-3">
                    <div className="flex text-white ">
                        <div
                            className="mr-auto flex flex-grow cursor-pointer items-center text-ellipsis whitespace-nowrap"
                            onClick={handleExpandClick}
                        >
                            <div aria-label="Show more" className="mr-1 inline-block p-2 text-white">
                                <XCircleIcon className="h-[20px] w-[20px] text-white" />
                            </div>
                            {message}
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
                            <a
                                className="ml-auto inline-block inline-flex cursor-pointer items-center text-white hover:underline"
                                href={githubReportLink}
                                target="_blank"
                            >
                                <BugAntIcon className="mr-1 h-3 w-3" />
                                <Trans>Report on GitHub</Trans>
                            </a>
                        </div>
                    </div>
                ) : null}
            </div>
        </SnackbarContent>
    );
});
