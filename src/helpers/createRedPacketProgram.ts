import { Program } from '@coral-xyz/anchor';

import { getAnchorProvider } from '@/helpers/getAnchorProvider.js';
import RedPacketIDL from '@/idl/redpacket.json' with { type: 'json' };
import type { Redpacket } from '@/types/sol-rp.js';

export async function createRedPacketProgram() {
    const provider = await getAnchorProvider();
    const RedPacketProgram = new Program(RedPacketIDL as Redpacket, provider);
    return RedPacketProgram;
}
