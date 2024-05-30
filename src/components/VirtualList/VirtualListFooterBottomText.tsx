import { t } from '@lingui/macro';

export function VirtualListFooterBottomText() {
    return (
        <div className="flex items-center justify-center p-6 text-base text-secondary">
            {t`You've hit rock bottom.`}
        </div>
    );
}
