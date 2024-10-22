import { Trans } from '@lingui/macro';

import { SolanaMethodButton } from '@/app/(developers)/components/SolanaMethodButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export enum SolanaMethodType {
    GET_ACCOUNT = 'publicKey',
    SIGN_MESSAGE = 'signMessage',
}

type Item = {
    method: SolanaMethodType;
    title: string;
    description: string;
};

const items: Item[] = [
    {
        method: SolanaMethodType.GET_ACCOUNT,
        title: 'Account',
        description: 'Returns current account.',
    },
    {
        method: SolanaMethodType.SIGN_MESSAGE,
        title: 'Sign Message',
        description: 'Signs a message.',
    },
];

export default function Page() {
    setupLocaleForSSR();

    const renderItem = (item: Item) => {
        return <SolanaMethodButton method={item.method} />;
    };

    return (
        <Section className="h-screen">
            <Headline>
                <Trans>Solana Method Test</Trans>
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
