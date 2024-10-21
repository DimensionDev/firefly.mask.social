import { Trans } from '@lingui/macro';
import { EthereumMethodType } from '@masknet/web3-shared-evm';

import { EthereumMethodButton } from '@/app/(developers)/components/EthereumMethodButton.js';
import { ParticleProvider } from '@/app/(developers)/components/PraticleProvider.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import type { MethodItem } from '@/types/ethereum.js';

type Item = MethodItem & {
    title: string;
    description: string;
};

const items: Item[] = [
    {
        method: EthereumMethodType.ETH_ACCOUNTS,
        title: 'Accounts',
        description: 'Returns a list of addresses owned by client.',
    },
    {
        method: EthereumMethodType.ETH_GET_BALANCE,
        title: 'Get Balance',
        description: 'Returns the balance of the account of given address.',
    },
    {
        method: EthereumMethodType.ETH_SIGN,
        title: 'Sign Message',
        description: 'Signs a message with the private key of an account.',
    },
    {
        method: EthereumMethodType.ETH_SEND_TRANSACTION,
        title: 'Send Transaction',
        description: 'Creates new message call transaction or a contract creation, if the data field contains code.',
    },
];

export default function Page() {
    setupLocaleForSSR();

    const renderItem = (item: Item) => {
        return (
            <ParticleProvider>
                <EthereumMethodButton item={item} />
            </ParticleProvider>
        );
    };

    return (
        <Section className="h-screen">
            <Headline>
                <Trans>Ethereum JSON RPC</Trans>
            </Headline>

            {
                <menu className="no-scrollbar w-full flex-1 overflow-auto">
                    {items.map((x, i) => {
                        return (
                            <ClickableArea
                                className={classNames(
                                    'mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main',
                                )}
                                key={i}
                            >
                                <div className="flex-1">
                                    <h2 className="mb-2">
                                        <span>{x.title}</span>
                                        <span className="ml-2 rounded-md bg-bg p-1 text-sm text-secondary">
                                            {`${x.method}()`}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-secondary">{x.description}</p>
                                </div>
                                <div className="max-w-[50%]">{renderItem(x)}</div>
                            </ClickableArea>
                        );
                    })}
                </menu>
            }
        </Section>
    );
}
