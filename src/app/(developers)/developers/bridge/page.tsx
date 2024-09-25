import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { headers } from 'next/headers.js';

import { NativeMethodButton } from '@/app/(developers)/components/NativeMethodButton.js';
import { WebMethodButton } from '@/app/(developers)/components/WebMethodButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { SITE_DESCRIPTION } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import {
    type HeaderItem,
    type NativeMethodItem,
    Platform,
    SupportedNativeMethod,
    SupportedWebMethod,
    type WebMethodItem,
} from '@/types/bridge.js';

type Item = (HeaderItem | NativeMethodItem | WebMethodItem) & {
    title: string;
    description: string;
};

const items: Item[] = [
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
        type: 'native-method-call',
        name: SupportedNativeMethod.LOGIN,
        title: 'Login',
        description: 'Login an account.',
        params: {
            platform: Platform.FIREFLY,
        },
    },
    {
        type: 'native-method-call',
        name: SupportedNativeMethod.SHARE,
        title: 'Share',
        description: 'Share a text with firefly app.',
        params: {
            text: SITE_DESCRIPTION,
        },
    },
    {
        type: 'native-method-call',
        name: SupportedNativeMethod.COMPOSE,
        title: 'Compose',
        description: 'Compose a text with firefly app.',
        params: {
            text: SITE_DESCRIPTION,
            platform: Platform.FARCASTER,
            urls: ['https://firefly.mask.social/og.png'],
        },
    },
    {
        type: 'native-method-call',
        name: SupportedNativeMethod.GET_SUPPORTED_METHODS,
        title: 'Get Supported Methods',
        description: 'Get supported methods from firefly app.',
    },
    {
        type: 'native-method-call',
        name: SupportedNativeMethod.GET_WALLET_ADDRESS,
        title: 'Get Wallet Address',
        description: 'Get wallet address from firefly app.',
    },
    {
        type: 'native-method-call',
        name: SupportedNativeMethod.CONNECT_WALLET,
        title: 'Connect Wallet',
        description: 'Connect wallet from firefly app.',
    },

    // web methods
    {
        type: 'web-method-call',
        name: SupportedWebMethod.GET_SUPPORTED_METHODS,
        title: 'Get Supported Methods',
        description: 'Get supported methods from web app.',
        params: [SupportedWebMethod.GET_SUPPORTED_METHODS, SupportedWebMethod.GET_WALLET_ADDRESS],
    },
    {
        type: 'web-method-call',
        name: SupportedWebMethod.GET_WALLET_ADDRESS,
        title: 'Get Wallet Address',
        description: 'Get wallet address from web app.',
        params: ['0x'],
    },
    {
        type: 'web-method-call',
        name: SupportedWebMethod.CONNECT_WALLET,
        title: 'Connect Wallet',
        description: 'Connect wallet from web app.',
        params: {
            walletAddress: '0x',
        },
    },
    {
        type: 'web-method-call',
        name: 'login',
        title: 'Login',
        description: 'Login an account.',
        params: {
            success: 'true',
        },
    },
];

export default function Page() {
    const renderItem = (item: (typeof items)[0]) => {
        const type = item.type;

        switch (type) {
            case 'header':
                return <span className="break-all">{headers().get(item.name) ?? 'N/A'}</span>;
            case 'native-method-call':
                return <NativeMethodButton item={item} />;
            case 'web-method-call':
                return <WebMethodButton item={item} />;
            default:
                safeUnreachable(type);
                return null;
        }
    };

    return (
        <Section>
            <Headline className="sticky top-0 z-10">
                <Trans>Firefly Bridge</Trans>
            </Headline>

            {
                <menu className="w-full">
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
