import type { CompositionType } from '@masknet/plugin-infra/content-script';
import { CrossIsolationMessages } from '@masknet/shared-base';

export function openRedPacketDialog(compositionType: CompositionType = 'timeline') {
    CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({ open: true, compositionType });
}
