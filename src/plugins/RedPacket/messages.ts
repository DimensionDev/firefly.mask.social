import { getPluginRPC } from '@masknet/plugin-infra';

import { RedPacketPluginID } from '@/plugins/RedPacket/constants.js';

import.meta.webpackHot?.accept();
export const RedPacketRPC = getPluginRPC<typeof import('./Worker/services.js')>(RedPacketPluginID);
