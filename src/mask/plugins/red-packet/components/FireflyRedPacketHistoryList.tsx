import { memo } from 'react';

import { makeStyles } from '@/mask/bindings/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`;
    return {
        root: {
            display: 'flex',
            padding: 0,
            boxSizing: 'border-box',
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            height: 474,
            [smallQuery]: {
                padding: 0,
            },
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        placeholder: {
            height: 474,
            boxSizing: 'border-box',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            '& div': {
                textAlign: 'center',
            },
        },
    };
});

interface RedPacketHistoryListProps {
    handleOpenDetails: (rpid: string) => void;
    historyType: FireflyRedPacketAPI.ActionType;
}

export const FireflyRedPacketHistoryList = memo(function RedPacketHistoryList({
    handleOpenDetails,
    historyType,
}: RedPacketHistoryListProps) {
    return null;
});
