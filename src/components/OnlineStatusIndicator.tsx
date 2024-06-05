import { t } from '@lingui/macro';
import { useNetworkState } from 'react-use';

import { Tooltip } from '@/components/Tooltip.js';

export function OnlineStatusIndicator() {
    const { online } = useNetworkState();
    return (
        <Tooltip content={online ? t`Online` : t`Offline`} placement="top">
            <div className="p-2">
                <div
                    className={`h-2 w-2 cursor-pointer rounded-full ${online ? 'bg-success' : 'bg-danger'}`}
                    style={{
                        filter: `drop-shadow(0px 4px 10px var(${online ? '--color-success' : '--color-danger'}))`,
                    }}
                />
            </div>
        </Tooltip>
    );
}
