import { PluginID } from '@masknet/shared-base';
import type { FireflyContext } from '../types.js';
interface RedPacketDialogProps {
    open: boolean;
    onClose: () => void;
    isOpenFromApplicationBoard?: boolean;
    source?: PluginID;
    fireflyContext: FireflyContext;
}
export default function RedPacketDialog(props: RedPacketDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RedPacketDialog.d.ts.map