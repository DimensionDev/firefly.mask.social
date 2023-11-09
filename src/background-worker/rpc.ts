import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import * as Service from './service.js'
import { addListener } from './message-port.js'

// RPC
const channel: CallbackBasedChannel = {
    setup(jsonRPCHandlerCallback) {
        addListener('rpc', (message, _, response) => {
            jsonRPCHandlerCallback(message).then((data) => response('rpc', data))
        })
    },
}
AsyncCall(Service, { channel, log: true, serializer })
