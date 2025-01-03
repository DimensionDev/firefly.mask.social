import { memo } from 'react';

import * as controls from '@/modals/FrameViewerModal/controls.js';
import { ReviewTransactionPopover } from '@/modals/FrameViewerModal/ReviewTransactionPopover.js';

export const Modals = memo(function Modals() {
    return (
        <>
            <ReviewTransactionPopover ref={controls.ReviewTransactionPopoverRef.register} />
        </>
    );
});
