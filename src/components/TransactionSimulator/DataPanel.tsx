import { useMemo } from 'react';

import { getPanelConfig } from '@/components/TransactionSimulator/config.js';
import { SimulateType } from '@/constants/enum.js';
import type { SimulateResponse, SimulationOptions } from '@/providers/types/Tenderly.js';

interface DataPanelProps {
    type: SimulateType;
    data: SimulationOptions;
    loading?: boolean;
    simulation: SimulateResponse['data'];
}

export function DataPanel({ type, data, simulation, loading = false }: DataPanelProps) {
    const filteredConfig = useMemo(() => {
        return getPanelConfig().filter(({ modules }) => modules.includes(type));
    }, [type]);

    return (
        <menu>
            {filteredConfig.map(({ title, icon: Icon, showLoading, content }) => {
                return loading && showLoading ? null : (
                    <li className="mb-3.5 flex items-center justify-between gap-2 text-[13px] leading-6" key={title}>
                        <span className="contents text-lightSecond">
                            {Icon ? <Icon width={16} height={16} /> : null}
                            <span>{title}</span>
                        </span>
                        <span className="min-w-0 flex-1 truncate text-right font-medium text-lightMain">
                            {content(data, simulation) || '--'}
                        </span>
                    </li>
                );
            })}
        </menu>
    );
}
