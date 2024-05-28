import { t, Trans } from '@lingui/macro';

export function VirtualListFooterBottomText() {
    return (
        <div className="flex items-center justify-center p-6 text-base text-secondary">
            <Trans>{t`You've hit rock bottom.`}</Trans>
        </div>
    );
}
