import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { headers } from 'next/headers.js';

import { MethodButton } from '@/app/(developers)/components/MethodButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { type HeaderItem, type MethodItem, SupportedMethod } from '@/types/bridge.js';

type Item = (HeaderItem | MethodItem) & {
    title: string;
    description: string;
};

const items: Item[] = [
    // request headers
    {
        type: 'header',
        title: 'Authorization',
        description: 'Authorization header if the user is logged in.',
        name: 'authorization',
    },
    {
        type: 'header',
        title: 'Theme',
        description: 'Theme settings from native app.',
        name: 'x-theme',
    },
    {
        type: 'header',
        title: 'Language',
        description: 'Language settings from native app.',
        name: 'x-language',
    },

    // native methods
    {
        type: 'method',
        name: SupportedMethod.LOGIN,
        title: 'Login',
        description: 'Login an account.',
    },
    {
        type: 'method',
        name: SupportedMethod.SHARE,
        title: 'Share',
        description: 'Share a text with firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.COMPOSE,
        title: 'Compose',
        description: 'Compose a text with firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_SUPPORTED_METHODS,
        title: 'Get Supported Methods',
        description: 'Get supported methods from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_WALLET_ADDRESS,
        title: 'Get Wallet Address',
        description: 'Get wallet address from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.CONNECT_WALLET,
        title: 'Connect Wallet',
        description: 'Connect wallet from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.BACK,
        title: 'Back',
        description: 'Close the current page.',
    },
];

export default function Page() {
    const renderItem = (item: (typeof items)[0]) => {
        const type = item.type;

        switch (type) {
            case 'header':
                return <span className="break-all">{headers().get(item.name) ?? 'N/A'}</span>;
            case 'method':
                return <MethodButton item={item} />;
            default:
                safeUnreachable(type);
                return null;
        }
    };

    return (
        <Section className="h-screen">
            <Headline>
                <Trans>Firefly Bridge</Trans>
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
                                            {x.type}
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
