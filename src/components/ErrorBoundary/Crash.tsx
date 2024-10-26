import { useMemo } from 'react';
import { useTimeoutFn } from 'react-use';

import { env } from '@/constants/env.js';
import { Link } from '@/esm/Link.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

export interface ErrorBoundaryError {
    /** Type of the Error */
    type: string;
    /** The Error message */
    message: string;
    /** The error stack */
    stack: string;
}

export interface CrashProps extends React.PropsWithChildren<ErrorBoundaryError> {
    /** Type of the Error */
    type: string;
    /** The Error message */
    message: string;
    /** The error stack */
    stack: string;
    /** The component part in the boundary */
    subject: string;

    onRetry: () => void;
}
export function CrashUI({ onRetry, subject, ...error }: CrashProps) {
    // This is a rarely reported crash. It is likely a race condition.
    // http://github.com/DimensionDev/mask.social/issues?q=Failed+to+execute+%27insertBefore%27+on+%27Node%27+
    // It seems like DOM mutation from out of our application might conflict with React reconciliation.
    // As a temporary fix, try to recover this React tree after 200ms.
    useTimeoutFn(() => {
        if (error.message.includes("Failed to execute 'insertBefore' on 'Node'")) {
            onRetry();
        }
    }, 200);

    // crash report, will send to GitHub
    const reportTitle = `[Crash] ${error.type}: ${error.message}`;
    const reportBody = `<!--Thanks for the crash report!
Please write down what you're doing when the crash happened, that will help us to fix it easier!-->

I was *doing something...*, then application reports an error.

> ${error.message}

Error stack:

<pre>${error.stack}</pre>

Version: ${env.shared.VERSION}
Commit Hash: ${env.shared.COMMIT_HASH}
Developer Settings: ${useDeveloperSettingsState.getState().developmentAPI}
`;

    const githubLink = useMemo(() => {
        const url = new URLSearchParams();
        url.set('title', reportTitle);
        url.set('body', reportBody);
        return 'http://github.com/DimensionDev/mask.social/issues/new?' + url.toString();
    }, [reportBody, reportTitle]);

    return (
        <div className="mt-4 w-full flex-1 overflow-x-auto p-5 contain-paint">
            <div className="rounded-sm border-red-500 p-5 text-red-500">
                <div className="mb-2 select-text">
                    {error.type}: {error.message}
                </div>
                <div className="flex gap-2">
                    <button onClick={onRetry}>Try to recover</button>
                    <Link href={githubLink} target="_blank">
                        Report on GitHub
                    </Link>
                </div>
                <div className="h-[300px] select-text overflow-x-auto">
                    <pre>
                        <code>{error.stack}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
