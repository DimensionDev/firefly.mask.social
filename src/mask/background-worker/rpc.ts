import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full';

import { addListener } from '@/mask/background-worker/message-port.js';
import * as Service from '@/mask/background-worker/service.js';
// eslint-disable-next-line no-restricted-imports
import { encoder } from '@/maskbook/packages/shared-base/src/serializer/index.js';

// RPC
const channel: CallbackBasedChannel = {
    setup(jsonRPCHandlerCallback) {
        addListener('rpc', (message, _, response) => {
            jsonRPCHandlerCallback(message).then((data) => response('rpc', data));
        });
    },
};
AsyncCall(Service, { channel, log: true, encoder });
