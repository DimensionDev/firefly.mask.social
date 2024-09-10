import { Trans } from '@lingui/macro';
import { makeStyles, MaskColors } from '@masknet/theme';
import { Box, type BoxProps, Typography } from '@mui/material';
import { memo } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    text: {
        color: MaskColors[theme.palette.mode].maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        marginTop: theme.spacing(1.5),
    },
}));

interface Props extends BoxProps {
    iconSize?: number;
}

export const EmptyStatus = memo(function EmptyStatus({ className, children, iconSize = 32, ...rest }: Props) {
    const { classes, cx } = useStyles();
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <GhostHoleIcon width={200} height={143} className="text-third" />
            <Typography className={classes.text} component="div">
                {children ?? <Trans>There is no data available for display.</Trans>}
            </Typography>
        </Box>
    );
});
