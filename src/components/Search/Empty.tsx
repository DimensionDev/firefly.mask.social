import { t, Trans } from '@lingui/macro';

interface EmptyProps {
    keyword: string;
}

export function Empty({ keyword }: EmptyProps) {
    return (
        <div className="mx-16">
            <div className="text-sm text-main">{t`No results for "${keyword}"`}</div>
            <p className="mt-4 text-center text-sm text-second">
                <Trans>Try searching for something else.</Trans>
            </p>
        </div>
    );
}
