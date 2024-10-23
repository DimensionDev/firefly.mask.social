import { PluginID } from '@masknet/shared-base';
/**
 * !! Change this key cause a breaking change in the red packet plugin.
 * !! Please make sure it also be able to recognize the old key.
 */
export declare const RedPacketMetaKey = "com.maskbook.red_packet:1";
export declare const RedPacketNftMetaKey = "com.maskbook.red_packet_nft:1";
/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
export declare const RedPacketPluginID = PluginID.RedPacket;
export declare const RED_PACKET_DEFAULT_SHARES = 5;
export declare const RED_PACKET_MIN_SHARES = 1;
export declare const RED_PACKET_MAX_SHARES = 255;
// # sourceMappingURL=constants.d.ts.map