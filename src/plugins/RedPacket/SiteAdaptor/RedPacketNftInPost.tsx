import { MaskLightTheme } from '@masknet/theme';
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base';
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types';
import { ThemeProvider } from '@mui/material';
import { useEffect } from 'react';

import { RedPacketRPC } from '@/plugins/RedPacket/messages.js';
import { RedPacketNft } from '@/plugins/RedPacket/SiteAdaptor/RedPacketNft.jsx';

interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload;
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    useEffect(() => {
        RedPacketRPC.updateRedPacketNft({
            id: payload.txid,
            type: 'red-packet-nft',
            password: payload.privateKey,
            contract_version: payload.contractVersion,
        });
    }, [payload]);
    return (
        <EVMWeb3ContextProvider chainId={payload.chainId}>
            <ThemeProvider theme={MaskLightTheme}>
                <RedPacketNft payload={payload} />
            </ThemeProvider>
        </EVMWeb3ContextProvider>
    );
}
