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
import { useAccount, useEnsName } from 'wagmi';

import WalletIcon from '@/assets/wallet.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useProfileStoreAll } from '@/hooks/useProfileStore.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { RED_PACKET_DEFAULT_SHARES } from '@/mask/plugins/red-packet/constants.js';
import { RequirementType } from '@/mask/plugins/red-packet/types.js';
import type { FireflyRedPacketAPI } from '@/maskbook/packages/web3-providers/src/entry-types.js';

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
};

export const RedPacketContext = createContext<RedPacketContextValue>(initialRedPacketContextValue);

export function RedPacketProvider({ children }: PropsWithChildren) {
    const account = useAccount();
    const { data: ensName } = useEnsName({ address: account.address });
    const allProfile = useProfileStoreAll();
    const [message, setMessage] = useState('');
    const [shares, setShares] = useState<number>(RED_PACKET_DEFAULT_SHARES);
    const [randomType, setRandomType] = useState<RandomType>('random');
    const [customThemes, setCustomThemes] = useState<FireflyRedPacketAPI.ThemeGroupSettings[]>([]);

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
        ],
    );

    return <RedPacketContext.Provider value={ctxValue}>{children}</RedPacketContext.Provider>;
}
