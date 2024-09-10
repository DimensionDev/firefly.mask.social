import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import CalendarIcon from '@/assets/calendar.svg';

export function Footer() {
    return (
        <div className="blur-10 absolute bottom-0 left-0 flex w-full rounded-b-lg backdrop-filter">
            <div className="flex w-full items-center justify-between p-12">
                <div className="flex items-center gap-2">
                    <CalendarIcon width={24} height={24} />
                    <Typography className="text-16 leading-20 items-center font-bold text-main">
                        <Trans>Calendar</Trans>
                    </Typography>
                </div>
            </div>
        </div>
    );
}
