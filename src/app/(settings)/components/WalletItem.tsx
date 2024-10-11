import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';

import { DisconnectButton } from '@/app/(settings)/components/DisconnectButton.js';
import { ReportButton } from '@/app/(settings)/components/ReportButton.js';
import LinkIcon from '@/assets/link-square.svg';
import WalletIcon from '@/assets/wallet-circle.svg';
import VerifiedDarkIcon from '@/assets/wallet-circle-verified.dark.svg';
import VerifiedLightIcon from '@/assets/wallet-circle-verified.light.svg';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { NetworkPluginID, WalletSource } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress, formatSolanaAddress } from '@/helpers/formatAddress.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { BlockScanExplorerResolver } from '@/providers/ethereum/ExplorerResolver.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface WalletItemProps {
    noAction?: boolean;
    connection: FireflyWalletConnection;
}

export function WalletItem({ connection, noAction = false }: WalletItemProps) {
    const isDark = useIsDarkMode();
    const evmNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, EVMChainId.Mainnet);
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);

    const chainIcon = {
        eth: evmNetworkDescriptor?.icon,
        solana: solanaNetworkDescriptor?.icon,
    }[connection.platform];

    const chainIconImage = chainIcon ? (
        <Image src={chainIcon} width={16} height={16} alt={connection.platform} className="mr-1 inline-block h-4 w-4" />
    ) : null;

    const addressLink =
        connection.platform === 'eth'
            ? BlockScanExplorerResolver.addressLink(EVMChainId.Mainnet, connection.address)
            : null;

    return (
        <div className="mb-3 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 text-medium text-lightMain shadow-primary backdrop-blur dark:bg-bg">
            {!connection.canReport ? (
                isDark ? (
                    <VerifiedDarkIcon width={24} height={24} />
                ) : (
                    <VerifiedLightIcon width={24} height={24} />
                )
            ) : (
                <WalletIcon width={24} height={24} />
            )}
            <div className="flex flex-1 flex-col text-left">
                {connection.ens?.[0] ? (
                    <span className="flex items-center text-base font-bold">
                        {chainIconImage}
                        {connection.ens[0]}
                    </span>
                ) : null}
                <div
                    className={classNames(
                        'flex items-center',
                        connection.ens?.[0] ? 'text-lightSecond' : 'font-semibold text-lightMain',
                    )}
                >
                    <span className="flex items-center truncate">
                        {!connection.ens?.[0] ? chainIconImage : null}
                        {connection.platform === 'eth'
                            ? formatEthereumAddress(connection.address, 8)
                            : connection.platform === 'solana'
                              ? formatSolanaAddress(connection.address, 8)
                              : connection.address}
                    </span>
                    <CopyButton value={connection.address} />
                    {addressLink ? (
                        <Link target="_blank" className="ml-1" href={addressLink}>
                            <LinkIcon width={13} height={13} />
                        </Link>
                    ) : null}
                </div>
            </div>
            {noAction ? null : !connection.canReport ? (
                [WalletSource.Particle].includes(connection.source) ? null : (
                    <DisconnectButton connection={connection} />
                )
            ) : (
                <ReportButton connection={connection} />
            )}
        </div>
    );
}
