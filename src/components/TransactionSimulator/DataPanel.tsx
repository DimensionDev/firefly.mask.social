import { t } from '@lingui/macro';
import { useMemo } from 'react';

import ReceiveIcon from '@/assets/receive-token.svg';
import SendIcon from '@/assets/send-token.svg';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';

export function DataPanel() {
    const panelConfig = useMemo(() => {
        return [
            {
                title: t`Pay`,
                icon: SendIcon,
                content: '0.00006 ETH',
            },
            {
                title: t`Receive`,
                icon: ReceiveIcon,
                content: '9.98508 MFER',
            },
            {
                title: t`Send`,
                icon: SendIcon,
                content: '0.00006 ETH',
            },
            {
                title: t`Approve`,
                content: '695857.78884 ONCHAIN',
            },
            {
                title: t`Signature Request`,
                content: 'Sign Typed Data',
            },
            {
                title: t`Network Fee`,
                content: '0.000081 ETH',
            },
            {
                title: t`Domain`,
                content: 'opensea.io',
            },
            {
                title: t`Chain`,
                content: (
                    <>
                        <ChainIcon className="inline" chainId={1} size={24} />
                        <span className="ml-2.5">Ethereum</span>
                    </>
                ),
            },
        ];
    }, []);
    return (
        <menu>
            {panelConfig.map(({ title, icon: Icon, content }) => (
                <li className="mb-3.5 flex items-center justify-between gap-2 text-[13px] leading-6" key={title}>
                    <span className="contents text-lightSecond">
                        {Icon ? <Icon width={16} height={16} /> : null}
                        <span>{title}</span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right font-medium text-lightMain">{content}</span>
                </li>
            ))}
        </menu>
    );
}
