import { Trans } from '@lingui/macro';

export function NoResultsFallback() {
    return (
        <div className="flex items-center justify-center pb-4 pt-6">
            <Trans>No results</Trans>
        </div>
    );
}
