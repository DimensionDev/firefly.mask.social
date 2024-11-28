import { ChainId } from '@masknet/web3-shared-evm';
interface OperationFooterProps {
    chainId?: ChainId;
    canClaim: boolean;
    canRefund: boolean;
    canShare?: boolean;
    /** Is claiming or checking claim status */
    isClaiming: boolean;
    isRefunding: boolean;
    onShare?(): void;
    onClaimOrRefund: () => void | Promise<void>;
}
export declare function OperationFooter({ chainId, canClaim, canRefund, canShare, isClaiming, isRefunding, onShare, onClaimOrRefund, }: OperationFooterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=OperationFooter.d.ts.map