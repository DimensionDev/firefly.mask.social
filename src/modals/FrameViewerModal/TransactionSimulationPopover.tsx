'use client';

import { Trans } from '@lingui/macro';
import { forwardRef, useState } from 'react';

import { TransactionSimulator } from '@/components/TransactionSimulator/SimulatorContent.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { Popover } from '@/modals/FrameViewerModal/Popover.js';
import type { FrameV2 } from '@/types/frame.js';

export interface TransactionSimulationPopoverProps {
    frame?: FrameV2;
    content?: React.ReactNode;
}

export const TransactionSimulationPopover = forwardRef<
    SingletonModalRefCreator<TransactionSimulationPopoverProps, boolean>
>(function TransactionSimulationPopover(_, ref) {
    const [props, setProps] = useState<TransactionSimulationPopoverProps>();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps(props);
        },
    });

    return (
        <Popover
            title={<Trans>Review Transaction</Trans>}
            content={
                <TransactionSimulator
                    options={null!}
                    showCloseButton={false}
                    onContinue={() => dispatch?.close(true)}
                    onClose={() => dispatch?.close(false)}
                />
            }
            frame={props?.frame}
            open={open}
            onClose={() => dispatch?.close(false)}
        />
    );
});
