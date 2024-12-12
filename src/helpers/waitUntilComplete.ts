import { type LensClient, LensTransactionStatusType } from '@lens-protocol/client/gated';

/**
 * Waits a transaction to complete (for lens only).
 * @param client A lens client instance
 * @param hash lens transaction hash
 * @returns
 */
export async function waitUntilComplete(client: LensClient, hash: string | null) {
    if (!hash) throw new Error('The transaction hash is missing.');

    const receipt = await client.transaction.waitUntilComplete({
        forTxHash: hash,
    });
    if (receipt?.status !== LensTransactionStatusType.Complete) throw new Error('The transaction was reverted.');
    return;
}
