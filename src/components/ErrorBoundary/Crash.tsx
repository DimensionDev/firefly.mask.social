'use client';

import { env } from '@/constants/env.js';
import { Link } from '@/esm/Link.js';
import { resolveValue } from '@/helpers/resolveValue.js';
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
    onRetry: () => void;
}
export function CrashUI({ onRetry, ...error }: CrashProps) {
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

    const githubLink = resolveValue(() => {
        const url = new URLSearchParams();
        url.set('title', reportTitle);
        url.set('body', reportBody);
        return 'http://github.com/DimensionDev/mask.social/issues/new?' + url.toString();
    });

    return (
        <div className="mt-4 w-full flex-1 overflow-x-auto p-5 contain-paint">
            <div className="rounded-md border border-red-500 p-5 text-red-500">
                <div>
                    <div className="mb-2 select-text">
                        {error.type}: {error.message}
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-md border border-blue-500 px-2 py-1 text-blue-500" onClick={onRetry}>
                            Try to recover
                        </button>
                        <Link
                            className="rounded-md border border-blue-500 px-2 py-1 text-blue-500"
                            href={githubLink}
                            target="_blank"
                        >
                            Report on GitHub
                        </Link>
                    </div>
                </div>
                <div className="mt-2 select-text overflow-x-auto">
                    <pre>
                        <code>{error.stack}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
