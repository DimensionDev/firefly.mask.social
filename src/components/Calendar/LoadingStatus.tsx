import { Trans } from '@lingui/macro';
import { LoadingBase } from '@masknet/theme';
import { Box, type BoxProps, Typography } from '@mui/material';
import { memo } from 'react';

import { classNames } from '@/helpers/classNames.js';

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
    return (
        <Box className={classNames('flex flex-col items-center justify-center', className)} p={2} {...rest}>
            <LoadingBase size={iconSize} className="text-main" />
            {omitText ? null : (
                <Typography className="mt-1.5 text-secondary">{children ?? <Trans>Loading...</Trans>}</Typography>
            )}
        </Box>
    );
});
