'use client';
import { decodeByNetwork, DecryptProgressKind, EncryptPayloadNetwork } from '@masknet/encryption';
import { RedPacketInspector } from '@masknet/plugin-redpacket';
import type { TypedMessage } from '@masknet/typed-message';
import { memo, type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import {
    type DecryptionContext,
    decryptWithDecoding,
} from '../../maskbook/packages/mask/background/services/crypto/index.js';

interface Props extends PropsWithChildren<{}> {
    raw: string;
}
export const DecryptPost = memo(function DecryptPost({ raw, children }: Props) {
    const decoded = useMemo(() => {
        return decodeByNetwork(EncryptPayloadNetwork.Twitter, raw);
    }, [raw]);
    const [result, setResult] = useState<TypedMessage | null>(null);

    useEffect(() => {
        const decrypt = async () => {
            const payload = {
                type: 'text',
                text: raw,
            } as const;
            const context: DecryptionContext = {
                encryptPayloadNetwork: EncryptPayloadNetwork.Twitter,
                currentProfile: null,
                authorHint: null,
                postURL: undefined,
            };
            for await (const progress of decryptWithDecoding(payload, context)) {
                if (progress.type === DecryptProgressKind.Success) {
                    return progress.content;
                }
            }
            return null;
        };
        decrypt().then((r) => setResult(r));
    }, [raw]);

    return (
        <>
            {children}
            {result ? <RedPacketInspector message={result} /> : null}
        </>
    );
});
