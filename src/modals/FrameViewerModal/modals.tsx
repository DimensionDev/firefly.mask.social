import { memo } from "react";
import * as controls from '@/modals/FrameViewerModal/controls.js';
import { MessagePopover } from "@/modals/FrameViewerModal/MessagePopover.js";

export const Modals = memo(function Modals() {
    return (
        <>
            <MessagePopover ref={controls.MessagePopoverRef.register} />
        </>
    )
})
