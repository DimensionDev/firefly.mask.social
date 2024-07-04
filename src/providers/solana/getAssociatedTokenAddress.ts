import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export async function getAssociatedTokenAddress(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<PublicKey> {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new Error('TokenOwnerOffCurveError');

    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId,
    );

    return address;
}
