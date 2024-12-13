import { LoadingStatus, PluginWalletStatusBar } from '@masknet/shared';
import { TabPanel } from '@mui/lab';
import { Box } from '@mui/material';
import { memo, Suspense } from 'react';

import { makeStyles } from '@/mask/bindings/index.js';
import { FireflyRedPacketHistoryList } from '@/mask/plugins/red-packet/components/FireflyRedPacketHistoryList.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

const useStyles = makeStyles()((theme) => ({
    tabWrapper: {
        padding: '12px 16px',
    },
    placeholder: {
        height: 474,
        boxSizing: 'border-box',
    },
}));

interface Props {
    tabs: Record<'sent' | 'claimed', 'sent' | 'claimed'>;
    handleOpenDetails: (rpid: string) => void;
}

export const FireflyRedPacketPast = memo(function FireflyRedPacketPast({ tabs, handleOpenDetails }: Props) {
    const { classes } = useStyles();

    return (
        <>
            <div className={classes.tabWrapper}>
                <TabPanel value={tabs.sent} style={{ padding: 0 }}>
                    <Suspense fallback={<LoadingStatus className={classes.placeholder} iconSize={30} />}>
                        <FireflyRedPacketHistoryList
                            handleOpenDetails={handleOpenDetails}
                            historyType={FireflyRedPacketAPI.ActionType.Send}
                        />
                    </Suspense>
                </TabPanel>
                <TabPanel value={tabs.claimed} style={{ padding: 0 }}>
                    <Suspense fallback={<LoadingStatus className={classes.placeholder} iconSize={30} />}>
                        <FireflyRedPacketHistoryList
                            handleOpenDetails={handleOpenDetails}
                            historyType={FireflyRedPacketAPI.ActionType.Claim}
                        />
                    </Suspense>
                </TabPanel>
            </div>
            <Box style={{ width: '100%', position: 'absolute', bottom: 0, zIndex: 99 }}>
                <PluginWalletStatusBar />
            </Box>
        </>
    );
});
