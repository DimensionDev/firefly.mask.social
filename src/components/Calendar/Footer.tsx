import { Trans } from '@lingui/macro';

import CalendarIcon from '@/assets/calendar-icon.svg';

export function Footer() {
    return (
        <div className="blur-10 absolute bottom-0 left-0 flex w-full rounded-b-lg backdrop-filter">
            <div className="flex w-full items-center justify-between p-3">
                <div className="flex items-center gap-2">
                    <CalendarIcon width={24} height={24} />
                    <p className="leading-20 items-center font-bold text-main">
                        <Trans>Calendar</Trans>
                    </p>
                </div>
            </div>
        </div>
    );
}
