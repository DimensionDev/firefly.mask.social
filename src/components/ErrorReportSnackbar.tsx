import { XCircleIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { type CustomContentProps,SnackbarContent, useSnackbar } from 'notistack';
import { forwardRef, useCallback, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';

interface ReportCompleteProps extends CustomContentProps {
    detail?: string;
}

export const ErrorReportSnackbar = forwardRef<HTMLDivElement, ReportCompleteProps>(function ErrorReportSnackbar(
    { id, detail, ...props },
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
                            {props.message}
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
                        <div className="inline-block cursor-pointer px-4 pb-2 text-white" onClick={handleExpandClick}>
                            {expanded ? <Trans>Show less</Trans> : <Trans>Show more</Trans>}
                        </div>
                    </div>
                ) : null}
            </div>
        </SnackbarContent>
    );
});
