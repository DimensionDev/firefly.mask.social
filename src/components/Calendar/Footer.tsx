import { Trans } from '@lingui/macro';
import { makeStyles, MaskColors } from '@masknet/theme';
import { Typography } from '@mui/material';

import CalendarIcon from '@/assets/calendar.svg';

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 12px 12px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
    },
    lineWrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        width: '100%',
    },
    calender: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    calendarText: {
        color: MaskColors[theme.palette.mode].maskColor.main,
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: '20px',
        alignItems: 'center',
    },
    providerName: {
        color: MaskColors[theme.palette.mode].maskColor.main,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        alignItems: 'center',
    },
}));

export function Footer() {
    const { classes } = useStyles();
    return (
        <div className={classes.container}>
            <div className={classes.lineWrap}>
                <div className={classes.calender}>
                    <CalendarIcon width={24} height={24} />
                    <Typography className={classes.calendarText}>
                        <Trans>Calendar</Trans>
                    </Typography>
                </div>
            </div>
        </div>
    );
}
