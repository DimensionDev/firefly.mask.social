import { memo } from 'react';

import { WalletItem } from '@/app/(settings)/components/WalletItem.js';
import QuestionIcon from '@/assets/question.svg';
import { Tooltip } from '@/components/Tooltip.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface WalletGroupProps {
    title: string;
    connections: FireflyWalletConnection[];
    tooltip?: string;
    noAction?: boolean;
}

export const WalletGroup = memo<WalletGroupProps>(function WalletGroup({
    title,
    connections,
    tooltip,
    noAction = false,
}) {
    if (!connections.length) return null;

    return (
        <div className="w-full">
            <p className="font-bold text-lightMain">
                {title}
                {tooltip ? (
                    <Tooltip placement="top" content={<div className="md:!max-w-[290px]">{tooltip}</div>}>
                        <QuestionIcon
                            className="ml-1 inline-block cursor-pointer text-lightSecond"
                            width={18}
                            height={18}
                        />
                    </Tooltip>
                ) : null}
            </p>
            <div className="mt-5">
                {connections.map((connection) => (
                    <WalletItem
                        key={connection.address}
                        connection={connection}
                        noAction={!connection.canReport && noAction}
                    />
                ))}
            </div>
        </div>
    );
});
