import { ElementAnchor, EmptyStatus, LoadingStatus } from '@masknet/shared';
import { type NetworkPluginID } from '@masknet/shared-base';
import { makeStyles } from '@masknet/theme';
import { useChainContext } from '@masknet/web3-hooks-base';
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { List } from '@mui/material';
import { type HTMLProps, memo, useMemo } from 'react';

import { 
    ActionType,
SourceType,
type RedPacketSentInfo
} from '@/providers/types/RedPacket.js';
import { useRedPacketTrans } from '@/plugins/RedPacket/locales/index.js';
import { useRedPacketHistory } from '@/plugins/RedPacket/SiteAdaptor/hooks/useRedPacketHistory.js';
import { RedPacketInHistoryList } from '@/plugins/RedPacket/SiteAdaptor/RedPacketInHistoryList.jsx';

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`;
    return {
        root: {
            display: 'flex',
            padding: 0,
            height: 474,
            boxSizing: 'border-box',
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            [smallQuery]: {
                padding: 0,
            },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        placeholder: {
            height: 474,
            boxSizing: 'border-box',
        },
    };
});

interface RedPacketHistoryListProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'> {
    onSelect: (payload: RedPacketJSONPayload) => void;
}

export const RedPacketHistoryList = memo(function RedPacketHistoryList({
    onSelect,
    ...rest
}: RedPacketHistoryListProps) {
    const t = useRedPacketTrans();
    const { classes, cx } = useStyles();
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>();
    const {
        data: historyData,
        isLoading,
        fetchNextPage,
    } = useRedPacketHistory(account, ActionType.Send, SourceType.MaskNetwork);
    const histories = useMemo(() => historyData.pages.flatMap((page) => page.data), [historyData, chainId]);

    if (isLoading) return <LoadingStatus className={classes.placeholder} iconSize={30} />;

    if (!histories?.length) return <EmptyStatus className={classes.placeholder}>{t.search_no_result()}</EmptyStatus>;

    return (
        <div {...rest} className={cx(classes.root, rest.className)}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history) => (
                    <RedPacketInHistoryList
                        key={history.redpacket_id}
                        history={history as RedPacketSentInfo}
                        onSelect={onSelect}
                    />
                ))}
                <ElementAnchor callback={() => fetchNextPage()} />
            </List>
        </div>
    );
});
