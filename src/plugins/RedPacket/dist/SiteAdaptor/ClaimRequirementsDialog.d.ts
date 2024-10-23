import { type GeneratedIcon } from '@masknet/icons';

import { type FireflyRedpacketSettings,RequirementType } from '@/plugins/RedPacket/src/types.ts';

interface ClaimRequirementsDialogProps {
    onNext: (settings: FireflyRedpacketSettings) => void;
    origin?: RequirementType[];
}
export declare const REQUIREMENT_ICON_MAP: Record<RequirementType, GeneratedIcon>;
export declare const REQUIREMENT_TITLE_MAP: Record<RequirementType, React.ReactNode>;
export declare function ClaimRequirementsDialog(props: ClaimRequirementsDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
// # sourceMappingURL=ClaimRequirementsDialog.d.ts.map
