import { t, Trans } from '@lingui/macro';
import { CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm';
import type { FunctionComponent, SVGAttributes } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import ReceiveIcon from '@/assets/receive-token.svg';
import SendIcon from '@/assets/send-token.svg';
import TradeInfo from '@/assets/trade-info.svg';
import TradeSecurity from '@/assets/trade-security.svg';
import WarningIcon from '@/assets/warning.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { SimulateStatus, SimulateType } from '@/constants/enum.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { SecurityMessageLevel, type StaticSecurityMessage } from '@/providers/types/Security.js';
import type { AssetChange, SimulateResponse, SimulationOptions } from '@/providers/types/Tenderly.js';

interface PanelConfig {
    title: string;
    modules: SimulateType[];
    content: (
        props: SimulationOptions,
        simulation?: SimulateResponse['data'],
    ) => JSX.Element | string | number | undefined | null;
    icon?: FunctionComponent<SVGAttributes<SVGElement>>;
    showLoading?: boolean;
}

interface StatusConfig {
    status: SimulateStatus;
    icon: FunctionComponent<SVGAttributes<SVGElement>>;
    className: string;
    iconClassName?: string;
    messages?: StaticSecurityMessage[];
    text: (message: string, retry?: () => void) => JSX.Element | string;
}

function formatAsset(asset?: AssetChange) {
    if (!asset) return null;

    const standard = asset.token_info?.standard || '';

    if (['ERC721', 'ERC1155'].includes(standard)) {
        return `${asset.token_info?.name || 'Unknown'} *${asset.amount}`;
    }

    return `${asset.amount} ${asset.token_info?.symbol?.toUpperCase() || 'Unknown'}`;
}

export function getPanelConfig(): PanelConfig[] {
    return [
        {
            title: t`Pay`,
            icon: SendIcon,
            showLoading: true,
            modules: [SimulateType.Swap],
            content: (_, simulation) => {
                return formatAsset(simulation?.assetChanges?.[1]);
            },
        },
        {
            title: t`Receive`,
            icon: ReceiveIcon,
            showLoading: true,
            modules: [SimulateType.Swap, SimulateType.Receive],
            content: (_, simulation) => {
                return formatAsset(simulation?.assetChanges?.[0]);
            },
        },
        {
            title: t`Send`,
            icon: SendIcon,
            showLoading: true,
            modules: [SimulateType.Send],
            content: (_, simulation) => {
                return formatAsset(simulation?.assetChanges?.[0]);
            },
        },
        {
            title: t`Approve`,
            showLoading: true,
            modules: [SimulateType.Approve],
            content: (_, simulation) => {
                const symbol = simulation?.extInfo?.approveTokenSymbol;
                const count = simulation?.extInfo?.approveTokenCount || 0;

                return !symbol && !count ? null : `${count} ${symbol}`;
            },
        },
        {
            title: t`Signature Request`,
            modules: [SimulateType.Signature],
            content: (_, simulation) => 'Sign Typed Data',
        },
        {
            title: t`Network Fee`,
            showLoading: true,
            modules: [SimulateType.Swap, SimulateType.Send, SimulateType.Approve, SimulateType.Receive],
            content: (_, simulation) => (simulation?.fee ? `${simulation.fee.value} ${simulation.fee.symbol}` : null),
        },
        {
            title: t`Domain`,
            modules: [
                SimulateType.Swap,
                SimulateType.Send,
                SimulateType.Approve,
                SimulateType.Receive,
                SimulateType.Signature,
                SimulateType.Unknown,
            ],
            content: (props) => parseUrl(props.url || '')?.host,
        },
        {
            title: t`Chain`,
            modules: [
                SimulateType.Swap,
                SimulateType.Send,
                SimulateType.Approve,
                SimulateType.Receive,
                SimulateType.Unknown,
                SimulateType.Signature,
            ],
            content: (props) => {
                const chain = CHAIN_DESCRIPTORS.find((chain) => chain.chainId === props?.chainId);
                return chain ? (
                    <span>
                        <ChainIcon className="inline" chainId={chain.chainId} size={20} />
                        <span className="ml-2.5">{chain.name}</span>
                    </span>
                ) : (
                    props?.chainId
                );
            },
        },
    ];
}

export function getStatusConfig(): StatusConfig[] {
    return [
        {
            status: SimulateStatus.Pending,
            icon: LoadingIcon,
            className: 'bg-lightBg text-lightSecond',
            iconClassName: 'animate-spin',
            text: () => <Trans>Simulating</Trans>,
        },
        {
            status: SimulateStatus.Unverified,
            icon: TradeInfo,
            className: 'bg-lightBg text-lightSecond',
            messages: [
                {
                    level: SecurityMessageLevel.Info,
                    title: t`Unverified`,
                    message: t`We were unable to simulate the transaction or complete all security detection. Please proceed with caution.`,
                },
            ],
            text: (_, retry) => (
                <span>
                    <Trans>Unverified: Failed to simulate,</Trans>
                    <ClickableButton className="text-lightHighlight" onClick={retry}>
                        {' '}
                        <Trans>try again</Trans>
                    </ClickableButton>
                </span>
            ),
        },
        {
            status: SimulateStatus.Unsafe,
            icon: WarningIcon,
            className: 'bg-commonWarn/10 text-commonWarn',
            text: () => <Trans>Unsafe: Transaction is at risk</Trans>,
        },
        {
            status: SimulateStatus.Success,
            icon: TradeSecurity,
            className: 'bg-success/10 text-success',
            messages: [
                {
                    level: SecurityMessageLevel.Safe,
                    title: t`Verified`,
                    message: t`Our transaction simulation and security detection found no issues. However, it is always crucial to double-check and proceed with caution.`,
                },
            ],
            text: () => <Trans>Verified</Trans>,
        },
        {
            status: SimulateStatus.Error,
            icon: TradeInfo,
            className: 'bg-danger/10 text-danger',
            text: (message: string) => message,
        },
    ];
}