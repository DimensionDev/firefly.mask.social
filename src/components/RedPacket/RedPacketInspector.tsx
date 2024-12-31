'use client';

import { Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { useAsyncRetry } from 'react-use';

import { RedPacketCard } from '@/components/RedPacket/RedPacketCard.js';
import type { EncryptedPayload } from '@/helpers/getEncryptedPayload.js';
import { RedPacketMetadataReader } from '@/helpers/renderWithRedPacketMetadata.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { decryptPayload } from '@/services/decryptPayload.js';

interface Props {
    post: Post;
    payloads?: EncryptedPayload[];
}

export function RedPacketInspector({ payloads, post }: Props) {
    const payload = first(payloads);

    const { value: [error, isE2E, message] = [null, false, null] } = useAsyncRetry(async () => {
        if (!payload) return;
        return decryptPayload(payload);
    }, [payload]);

    if (isE2E)
        return (
            <p className="p-2">
                <Trans>
                    This message is a e2e encrypted message. You can only decrypt this message when it is encrypted to
                    you and decrypt it with Mask Network extension.
                </Trans>
            </p>
        );

    if (error)
        return (
            <p className="p-2">
                <Trans>We encountered an error when try to decrypt this message: {error.message}</Trans>
            </p>
        );

    if (!message) return null;

    const meta = message.meta;
    const result = RedPacketMetadataReader(meta);
    if (result.isOk()) {
        const payload = result.unwrap();
        return <RedPacketCard payload={payload} post={post} />;
    }

    return null;
}
