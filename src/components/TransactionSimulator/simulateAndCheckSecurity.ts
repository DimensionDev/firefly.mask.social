import { safeUnreachable } from '@masknet/kit';

import { SimulateStatus, SimulateType } from '@/constants/enum.js';
import { GoPlus } from '@/providers/goplus/index.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

export async function simulateAndCheckSecurity(options: SimulationOptions) {
    switch (options.type) {
        case SimulateType.Signature:
            const result = await GoPlus.checkPhishingSite(options.data.url);
            const messages = result?.message_list?.map((message) => ({
                title: message.title(result),
                level: message.level,
                message: message.message(result),
            }));
            return {
                status: messages?.length ? SimulateStatus.Unsafe : SimulateStatus.Success,
                messages,
            };
        case SimulateType.Pay:
            return;
        case SimulateType.Send:
            return;
        case SimulateType.Approve:
            return;
        case SimulateType.Receive:
            return;
        case SimulateType.Unknown:
            return;
        default:
            safeUnreachable(options);
            return;
    }
}
