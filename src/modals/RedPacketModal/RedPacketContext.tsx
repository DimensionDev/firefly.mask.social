import { Trans } from '@lingui/macro';
import { type FungibleToken, multipliedBy, type NonFungibleCollection } from '@masknet/web3-shared-base';
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { compact, first, flatten, noop, uniqBy } from 'lodash-es';
import {
    createContext,
    type Dispatch,
    type PropsWithChildren,
    type ReactNode,
    type SetStateAction,
    useMemo,
    useState,
} from 'react';
import { mainnet } from 'viem/chains';
import { useAccount, useEnsName } from 'wagmi';

import WalletIcon from '@/assets/wallet2.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { useRedPacketThemes } from '@/hooks/useRedPacketThemes.js';
import { EVMChainResolver } from '@/mask/index.js';
import { RED_PACKET_DEFAULT_SHARES } from '@/constants/rp.js';
import type { FireflyRedPacketAPI } from '@/maskbook/packages/web3-providers/src/entry-types.js';
import { RequirementType } from '@/providers/red-packet/types.js';

export const redPacketRandomTabs = [
    {
        label: <Trans>Random Split</Trans>,
        value: 'random',
    },
    {
        label: <Trans>Equal Split</Trans>,
        value: 'equal',
    },
] as const;

export const redPacketCoverTabs = [
    {
        label: <Trans>Template</Trans>,
        value: 'default',
    },
    {
        label: <Trans>Custom</Trans>,
        value: 'custom',
    },
] as const;

export const redPacketFontColorTabs = [
    {
        label: <Trans>Golden</Trans>,
        value: 'golden',
    },
    {
        label: <Trans>Neutral</Trans>,
        value: 'neutral',
    },
] as const;

type RandomType = (typeof redPacketRandomTabs)[number]['value'];
type CoverTabType = (typeof redPacketCoverTabs)[number]['value'];
type FontColorTabType = (typeof redPacketFontColorTabs)[number]['value'];

interface RedPacketContextValue {
    message: string;
    token: FungibleToken<ChainId, SchemaType>;
    randomType: RandomType;
    shares: number;
    coverType: CoverTabType;
    fontColor: FontColorTabType;
    accounts: Array<{ icon: ReactNode; name: string }>;
    shareFrom: string;
    rawAmount: string;
    setRawAmount: Dispatch<SetStateAction<string>>;
    totalAmount: string;
    rules: RequirementType[];
    requireCollection?: NonFungibleCollection<ChainId, SchemaType>;
    setRequireCollection: Dispatch<SetStateAction<NonFungibleCollection<ChainId, SchemaType> | undefined>>;
    setRules: Dispatch<SetStateAction<RequirementType[]>>;
    setToken: Dispatch<SetStateAction<FungibleToken<ChainId, SchemaType> | undefined>>;
    setRandomType: Dispatch<SetStateAction<RandomType>>;
    setMessage: Dispatch<SetStateAction<string>>;
    setShares: Dispatch<SetStateAction<number>>;
    setCoverType: Dispatch<SetStateAction<CoverTabType>>;
    setFontColor: Dispatch<SetStateAction<FontColorTabType>>;
    setShareFrom: Dispatch<SetStateAction<string>>;
    customThemes: FireflyRedPacketAPI.ThemeGroupSettings[];
    setCustomThemes: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings[]>>;
    themes: FireflyRedPacketAPI.ThemeGroupSettings[];
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    setTheme: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings | undefined>>;
}

export const initialRedPacketContextValue: RedPacketContextValue = {
    message: '',
    shares: RED_PACKET_DEFAULT_SHARES,
    randomType: redPacketRandomTabs[0].value,
    coverType: redPacketCoverTabs[0].value,
    fontColor: redPacketFontColorTabs[0].value,
    accounts: EMPTY_LIST,
    shareFrom: '',
    token: null!,
    totalAmount: '',
    setRequireCollection: noop,
    rules: EMPTY_LIST,
    setRules: noop,
    setShareFrom: noop,
    setRandomType: noop,
    setShares: noop,
    setMessage: noop,
    setToken: noop,
    setCoverType: noop,
    setFontColor: noop,
    rawAmount: '',
    setRawAmount: noop,
    customThemes: EMPTY_LIST,
    setCustomThemes: noop,
    themes: EMPTY_LIST,
    theme: null!,
    setTheme: noop,
};

export const RedPacketContext = createContext<RedPacketContextValue>(initialRedPacketContextValue);

export function RedPacketProvider({ children }: PropsWithChildren) {
    const account = useAccount();
    const { data: ensName } = useEnsName({ address: account.address, chainId: mainnet.id });
    const allProfile = useProfileStoreAll();
    const [message, setMessage] = useState('');
    const [shares, setShares] = useState<number>(RED_PACKET_DEFAULT_SHARES);
    const [randomType, setRandomType] = useState<RandomType>('random');
    const [customThemes, setCustomThemes] = useState<FireflyRedPacketAPI.ThemeGroupSettings[]>([]);
    const { data: themes = EMPTY_LIST } = useRedPacketThemes();
    const [theme = themes[0], setTheme] = useState<FireflyRedPacketAPI.ThemeGroupSettings>();

    const { chainId } = useChainContext();
    const nativeToken = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId]);
    const [token = nativeToken, setToken] = useState<FungibleToken<ChainId, SchemaType>>();
    const [coverType, setCoverType] = useState<CoverTabType>('default');
    const [fontColor, setFontColor] = useState<FontColorTabType>('golden');
    const [shareFrom, setShareFrom] = useState<string>('');
    const [rules, setRules] = useState<RequirementType[]>([RequirementType.Follow]);
    const [requireCollection, setRequireCollection] = useState<
        NonFungibleCollection<ChainId, SchemaType> | undefined
    >();

    const [rawAmount, setRawAmount] = useState('');
    const isRandom = randomType === 'random';
    const totalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    );

    const accounts = useMemo(() => {
        return uniqBy(
            compact(
                flatten([
                    ...SORTED_SOCIAL_SOURCES.map((source) => {
                        const profile = allProfile[source]?.currentProfile;
                        if (!profile) return EMPTY_LIST;

                        return [
                            { icon: <SocialSourceIcon source={source} size={24} />, name: profile.handle },
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
            fontColor,
            setFontColor,
            accounts,
            shareFrom: shareFrom || first(accounts)?.name || '',
            setShareFrom,
            totalAmount,
            rules,
            setRules,
            requireCollection,
            setRequireCollection,
            rawAmount,
            setRawAmount,
            customThemes,
            setCustomThemes,
            themes,
            theme,
            setTheme,
        }),
        [
            message,
            shares,
            randomType,
            token,
            coverType,
            fontColor,
            accounts,
            shareFrom,
            totalAmount,
            rules,
            requireCollection,
            rawAmount,
            customThemes,
            themes,
            theme,
        ],
    );

    return <RedPacketContext.Provider value={ctxValue}>{children}</RedPacketContext.Provider>;
}
