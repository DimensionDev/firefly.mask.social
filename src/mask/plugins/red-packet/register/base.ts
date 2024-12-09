import type { Plugin } from '@masknet/plugin-infra';
import { EnhanceableSite, PluginID } from '@masknet/shared-base';
import { ChainId } from '@masknet/web3-shared-evm';

import { NetworkPluginID } from '@/constants/enum.js';
import { RedPacketMetaKey } from '@/mask/plugins/red-packet/constants.js';

export const base: Plugin.Shared.Definition = {
    ID: PluginID.RedPacket,
    name: { fallback: 'Lucky Drop' },
    description: {
        fallback:
            'Lucky drop is a special feature in Mask Network which was launched in early 2020. Once users have installed the Chrome/Firefox plugin, they can claim and give out cryptocurrencies on Twitter.',
    },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Polygon,
                    ChainId.Arbitrum,
                    ChainId.Base,
                    ChainId.xDai,
                    ChainId.Fantom,
                    ChainId.Optimism,
                    ChainId.Avalanche,
                    ChainId.Aurora,
                    ChainId.Conflux,
                    ChainId.Astar,
                    ChainId.Scroll,
                    ChainId.Metis,
                    ChainId.XLayer,
                ],
            },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        metadataKeys: new Set([RedPacketMetaKey]),
    },
};
