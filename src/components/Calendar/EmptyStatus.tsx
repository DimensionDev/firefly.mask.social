import { Trans } from '@lingui/macro';
import { Box, type BoxProps, Typography } from '@mui/material';
import { memo } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends BoxProps {
    iconSize?: number;
}

export const EmptyStatus = memo(function EmptyStatus({ className, children, iconSize = 32, ...rest }: Props) {
    return (
        <Box className={classNames('flex flex-col items-center justify-center', className)} p={2} {...rest}>
            <GhostHoleIcon width={100} height={70} className="text-third" />
            <Typography className="mt-1.5 text-second" component="div">
                {children ?? <Trans>There is no data available for display.</Trans>}
            </Typography>
        </Box>
    );
});
