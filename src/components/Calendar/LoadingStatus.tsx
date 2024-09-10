import { Trans } from '@lingui/macro';
import { LoadingBase, makeStyles, MaskColors } from '@masknet/theme';
import { Box, type BoxProps, Typography } from '@mui/material';
import { memo } from 'react';

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    icon: {
        color: MaskColors[theme.palette.mode].maskColor.main,
    },
    text: {
        color: MaskColors[theme.palette.mode].maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        marginTop: theme.spacing(1.5),
    },
}));

interface Props extends BoxProps {
    omitText?: boolean;
    iconSize?: number;
}

export const LoadingStatus = memo(function LoadingStatus({
    omitText,
    className,
    iconSize = 32,
    children,
    ...rest
}: Props) {
    const { classes, cx } = useStyles();
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <LoadingBase size={iconSize} className={classes.icon} />
            {omitText ? null : (
                <Typography className={classes.text}>{children ?? <Trans>Loading...</Trans>}</Typography>
            )}
        </Box>
    );
});
