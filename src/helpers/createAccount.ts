import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export function createAccount() {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return {
        account: account.address,
        privateKey,
    };
}
