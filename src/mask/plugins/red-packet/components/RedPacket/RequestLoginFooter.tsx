import { Trans } from '@lingui/macro';
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script';
import { Box } from '@mui/material';

import { ActionButton } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            padding: theme.spacing(1.5),
        },
    };
});

interface OperationFooterProps {
    onRequest?(): void;
}
export function RequestLoginFooter({ onRequest }: OperationFooterProps) {
    const { classes } = useStyles();
    const source = usePostInfoDetails.source();

    return (
        <Box className={classes.footer}>
            <ActionButton fullWidth variant="roundedDark" onClick={onRequest}>
                <Trans>Connect to {source}</Trans>
            </ActionButton>
        </Box>
    );
}