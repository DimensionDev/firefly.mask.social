import { keyRegistryABI, NobleEd25519Signer } from '@farcaster/core';
import { ChainId } from '@masknet/web3-shared-evm';
import { readContract } from '@wagmi/core';
import { parseUnits, toBytes } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { FarcasterInvalidSignerKey, MalformedError } from '@/constants/error.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { getPublicKeyInHex } from '@/services/ed25519.js';

enum KeyState {
    ADDED = 1,
    REMOVED = 2,
}

export async function validateFarcasterSession(session: FarcasterSession): Promise<true> {
    const signer = new NobleEd25519Signer(toBytes(session.token));
    const publicKey = await getPublicKeyInHex(signer);
    if (!publicKey) throw new MalformedError('Invalid signer key.');

    const [state, _] = await readContract(config, {
        abi: keyRegistryABI,
        address: '0x00000000Fc1237824fb747aBDE0FF18990E59b7e',
        functionName: 'keys',
        args: [parseUnits(session.profileId, 0), publicKey],
        chainId: ChainId.Optimism,
    });
    if (state !== KeyState.ADDED) throw new FarcasterInvalidSignerKey('Invalid signer key.');

    return true;
}
