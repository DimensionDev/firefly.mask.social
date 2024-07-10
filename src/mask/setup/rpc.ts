import { AsyncCall, type EventBasedChannel } from 'async-call-rpc/full';

import { addListener, postMessage } from '@/mask/setup/message.js';
// eslint-disable-next-line no-restricted-imports
import { encoder } from '@/maskbook/packages/shared-base/src/serializer/index.js';

const channel: EventBasedChannel = {
    on(listener) {
        return addListener('rpc', (message) => listener(message));
    },
    send(data) {
        postMessage('rpc', data);
    },
};

export const BackgroundWorker = AsyncCall<typeof import('../background-worker/service.js')>(
    {},
    { channel, log: true, encoder },
);
