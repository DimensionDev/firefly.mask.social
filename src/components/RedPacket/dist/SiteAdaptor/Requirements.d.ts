import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { type BoxProps } from '@mui/material';
interface Props extends BoxProps {
    onClose?(): void;
    statusList: FireflyRedPacketAPI.ClaimStrategyStatus[];
    showResults?: boolean;
}
export declare const Requirements: import("react").ForwardRefExoticComponent<Omit<Props, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=Requirements.d.ts.map