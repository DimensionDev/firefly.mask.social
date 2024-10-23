import type { RedPacketJSONPayload } from '@masknet/web3-providers/types';
import type { useAvailability } from '../hooks/useAvailability.js';
type Availability = ReturnType<typeof useAvailability>['data'];
export declare function useRedPacketCover(payload: RedPacketJSONPayload, availability: Availability): {
    themeId: string;
    backgroundImageUrl: string;
    backgroundColor: string;
    url: string;
} | null | undefined;
export {};
//# sourceMappingURL=useRedPacketCover.d.ts.map