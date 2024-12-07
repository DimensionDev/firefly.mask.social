import { Trans } from '@lingui/macro';
import { type FungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { compact, first, flatten, noop, uniqBy } from 'lodash-es';
import { createContext, type PropsWithChildren, type ReactNode, useMemo, useState } from 'react';
import { useAccount, useEnsName } from 'wagmi';

import WalletIcon from '@/assets/wallet.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { RED_PACKET_DEFAULT_SHARES } from '@/mask/plugins/red-packet/constants.js';

interface RedpacketContextValue {
    message: string;
    token?: FungibleToken<ChainId, SchemaType>;
    setToken: (token: FungibleToken<ChainId, SchemaType>) => void;
    randomType: 'random' | 'equal';
    setRandomType: (tab: 'random' | 'equal') => void;
    setMessage: (message: string) => void;
    shares: number | '';
    setShares: (shares: number | '') => void;
    coverType: 'default' | 'custom';
    setCoverType: (coverType: 'default' | 'custom') => void;
    displayType: 'light' | 'dark';
    setDisplayType: (displayType: 'light' | 'dark') => void;
    accounts: Array<{ icon: ReactNode; name: string }>;
    shareFrom: string;
    setShareFrom: (shareFrom: string) => void;
    totalAmount: string;
    setTotalAmount: (totalAmount: string) => void;
}

export const initialRedpacketContextValue: RedpacketContextValue = {
    message: '',
    shares: RED_PACKET_DEFAULT_SHARES,
    randomType: 'random',
    coverType: 'default',
    displayType: 'light',
    accounts: EMPTY_LIST,
    shareFrom: '',
    totalAmount: '',
    setShareFrom: noop,
    setRandomType: noop,
    setShares: noop,
    setMessage: noop,
    setToken: noop,
    setCoverType: noop,
    setDisplayType: noop,
    setTotalAmount: noop,
};

export const redpacketRandomTabs = [
    {
        label: <Trans>Random Split</Trans>,
        value: 'random',
    },
    {
        label: <Trans>Equal Split</Trans>,
        value: 'equal',
    },
] as const;

export const redpacketCoverTabs = [
    {
        label: <Trans>Default</Trans>,
        value: 'default',
    },
    {
        label: <Trans>Upload custom cover</Trans>,
        value: 'custom',
    },
];

export const redpacketDisplayTabs = [
    {
        label: <Trans>Light</Trans>,
        value: 'light',
    },
    {
        label: <Trans>Dark</Trans>,
        value: 'dark',
    },
];

export const RedpacketContext = createContext<RedpacketContextValue>(initialRedpacketContextValue);

export function RedpacketProvider({ children }: PropsWithChildren) {
    const account = useAccount();
    const { data: ensName } = useEnsName({ address: account.address });
    const allProfile = useProfileStoreAll();
    const [message, setMessage] = useState('');
    const [shares, setShares] = useState<number | ''>(RED_PACKET_DEFAULT_SHARES);
    const [randomType, setRandomType] = useState<'random' | 'equal'>('random');
    const [token, setToken] = useState<FungibleToken<ChainId, SchemaType>>();
    const [coverType, setCoverType] = useState<'default' | 'custom'>('default');
    const [displayType, setDisplayType] = useState<'light' | 'dark'>('light');
    const [shareFrom, setShareFrom] = useState<string>('');
    const [totalAmount, setTotalAmount] = useState<string>('');

    const accounts = useMemo(() => {
        return uniqBy(
            compact(
                flatten([
                    ...SORTED_SOCIAL_SOURCES.map((source) => {
                        const profile = allProfile[source]?.currentProfile;
                        if (!profile) return EMPTY_LIST;

                        return [
                            { icon: <SocialSourceIcon source={source} size={24} />, name: profile.displayName },
                            profile.ownedBy
                                ? {
                                      icon: <WalletIcon width={24} height={24} />,
                                      name: profile.ownedBy.address,
                                  }
                                : undefined,
                        ];
                    }),
                    account.address
                        ? {
                              icon: <WalletIcon width={24} height={24} />,
                              name: ensName || account.address || '',
                          }
                        : undefined,
                ]),
            ),
            (x) => x.name.toLowerCase(),
        );
    }, [allProfile, ensName, account.address]);

    const ctxValue = useMemo(
        () => ({
            message,
            setMessage,
            shares,
            setShares,
            randomType,
            setRandomType,
            token,
            setToken,
            coverType,
            setCoverType,
            displayType,
            setDisplayType,
            accounts,
            shareFrom: shareFrom || first(accounts)?.name || '',
            setShareFrom,
            totalAmount,
            setTotalAmount,
        }),
        [message, shares, randomType, token, coverType, displayType, accounts, shareFrom, totalAmount],
    );

    return <RedpacketContext.Provider value={ctxValue}>{children}</RedpacketContext.Provider>;
}
