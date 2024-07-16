import { keyRegistryABI, NobleEd25519Signer } from '@farcaster/core';
import { ChainId } from '@masknet/web3-shared-evm';
import { bytesToHex } from '@noble/hashes/utils';
import { readContract } from '@wagmi/core';
import { parseUnits, toBytes } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { FarcasterInvalidSignerKey, MalformedError, UnauthorizedError } from '@/constants/error.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

enum KeyState {
    ADDED = 1,
    REMOVED = 2,
}

export async function validateFarcasterSession(session: FarcasterSession): Promise<true> {
    const signer = new NobleEd25519Signer(toBytes(session.token));
    const publicKey = await signer.getSignerKey();

    if (publicKey.isErr()) throw new MalformedError('Invalid signer key.');

    const [state, _] = await readContract(config, {
        abi: keyRegistryABI,
        address: '0x00000000Fc1237824fb747aBDE0FF18990E59b7e',
        functionName: 'keys',
        args: [parseUnits(session.profileId, 0), `0x${bytesToHex(publicKey.value)}`],
        chainId: ChainId.Optimism,
    });
    if (state === KeyState.REMOVED) throw new FarcasterInvalidSignerKey('The signer key has been removed.');

    return true;
}
