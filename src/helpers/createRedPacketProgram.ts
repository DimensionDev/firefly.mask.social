import { Program } from '@coral-xyz/anchor';

import { getAnchorProvider } from '@/helpers/getAnchorProvider.js';
import RedPacketIDL from '@/idls/redpacket.json' with { type: 'json' };
import type { Redpacket } from '@/idls/redpacket.js';

export async function createRedPacketProgram() {
    const provider = await getAnchorProvider();
    const RedPacketProgram = new Program(RedPacketIDL as Redpacket, provider);
    return RedPacketProgram;
}
