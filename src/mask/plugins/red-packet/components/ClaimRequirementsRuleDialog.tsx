import { Trans } from '@lingui/macro';
import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { memo } from 'react';

import { Icons } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        background: theme.palette.maskColor.bottom,
        maxWidth: 400,
    },
    dialogTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        lineHeight: '18px',
        fontWeight: 700,
        margin: 'auto',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        marginBottom: theme.spacing(1.5),
    },
    description: {
        fontSize: 14,
        lineHeight: '18px',
    },
}));

export interface ClaimRequirementsRuleDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ClaimRequirementsRuleDialog = memo<ClaimRequirementsRuleDialogProps>(function ClaimRequirementsRuleDialog({
    open,
    onClose,
}) {
    const { classes } = useStyles();

    return (
        <Dialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogTitle className={classes.dialogTitle}>
                <Icons.Close onClick={onClose} />
                <Typography className={classes.title}>
                    <Trans>Claim Requirements</Trans>
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box mt={3} display="flex" flexDirection="column" rowGap={3}>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Follow me</Trans>
                        </Typography>
                        <Typography className={classes.description} component="div">
                            <Trans>
                                User must follow your account.
                                <p className="italic">
                                    <strong className="font-bold">Note:</strong> When you cross-post a Lucky Drop to
                                    multiple social networks, following you on any social allows users to claim.
                                </p>
                            </Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Like / Repost / Comment</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>
                                Users must like, repost / quote tweet, or comment on your post containing Lucky Drop.
                            </Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>NFT holder</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Users must hold one NFT from the collection you select.</Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Token holder</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Users must hold the token you select.</Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Farcaster channel member</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Farcaster users must be members of the channel you select.</Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Lens club member</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Lens users must be members of the club you select.</Trans>
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
});
