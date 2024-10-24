import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { MethodButton } from '@/app/(developers)/components/MethodButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { classNames } from '@/helpers/classNames.js';
import { type MethodItem, SupportedMethod } from '@/types/bridge.js';

type Item = MethodItem & {
    title: string;
    description: string;
};

const items: Item[] = [
    {
        type: 'method',
        name: SupportedMethod.GET_SUPPORTED_METHODS,
        title: 'Get Supported Methods',
        description: 'Get supported bridge methods.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_AUTHORIZATION,
        title: 'Get Authorization',
        description: 'Get authorization from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_THEME,
        title: 'Get Theme',
        description: 'Get theme from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_LANGUAGE,
        title: 'Get Language',
        description: 'Get language from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.GET_WALLET_ADDRESS,
        title: 'Get Wallet Address',
        description: 'Get connected wallet address from firefly app.',
    },
    {
        type: 'method',
        name: SupportedMethod.CONNECT_WALLET,
        title: 'Connect Wallet',
        description: 'Connect a wallet',
    },
    {
        type: 'method',
        name: SupportedMethod.BIND_WALLET,
        title: 'Bind Wallet',
        description: 'Bind a wallet',
    },
    {
        type: 'method',
        name: SupportedMethod.IS_TWITTER_USER_FOLLOWING,
        title: 'Is Twitter User Following',
        description: 'Check if a twitter user is following.',
    },
    {
        type: 'method',
        name: SupportedMethod.FOLLOW_TWITTER_USER,
        title: 'Follow Twitter User',
        description: 'Follow a twitter user.',
    },
    {
        type: 'method',
        name: SupportedMethod.UPDATE_NAVIGATOR_BAR,
        title: 'Update Navigator Bar',
        description: 'Update title on navigator bar.',
    },
    {
        type: 'method',
        name: SupportedMethod.OPEN_URL,
        title: 'Open URL',
        description: 'Open an URL.',
    },
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
        name: SupportedMethod.BACK,
        title: 'Back',
        description: 'Close the current page.',
    },
];

export default function Page() {
    const renderItem = (item: (typeof items)[0]) => {
        const type = item.type;

        switch (type) {
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
