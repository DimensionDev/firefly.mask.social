import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full';

import { addListener } from '@/mask/background-worker/message-port.js';
import * as Service from '@/mask/background-worker/service.js';
import { encoder } from '@/mask/bindings/index.js';

// RPC
const channel: CallbackBasedChannel = {
    setup(jsonRPCHandlerCallback) {
        addListener('rpc', (message, _, response) => {
            jsonRPCHandlerCallback(message).then((data) => response('rpc', data));
        });
    },
};
AsyncCall(Service, { channel, log: true, encoder });
