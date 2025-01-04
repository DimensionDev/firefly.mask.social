import { memo } from 'react';

import * as controls from '@/modals/FrameViewerModal/controls.js';
import { TransactionSimulationPopover } from '@/modals/FrameViewerModal/TransactionSimulationPopover.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <TransactionSimulationPopover ref={controls.TransactionSimulationPopoverRef.register} />
        </>
    );
});
