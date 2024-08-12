import { DisconnectButton } from '@/app/(settings)/components/DisconnectButton.js';
import { ReportButton } from '@/app/(settings)/components/ReportButton.js';
import WalletIcon from '@/assets/wallet-circle.svg';
import VerifiedDarkIcon from '@/assets/wallet-circle-verified.dark.svg';
import VerifiedLightIcon from '@/assets/wallet-circle-verified.light.svg';
import { CopyButton } from '@/components/CopyButton.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { formatSolanaAddress } from '@/helpers/formatSolanaAddress.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface WalletItemProps {
    noAction?: boolean;
    connection: FireflyWalletConnection;
}

export function WalletItem({ connection, noAction = false }: WalletItemProps) {
    const isDark = useIsDarkMode();

    return (
        <div
            className="mb-3 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 text-[15px] text-lightMain dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
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
                {connection.ens?.[0] ? <span className="text-base font-bold">{connection.ens[0]}</span> : null}
                <div
                    className={classNames(
                        'flex items-center',
                        connection.ens?.[0] ? 'text-lightSecond' : 'font-semibold text-lightMain',
                    )}
                >
                    <span>
                        {connection.platform === 'eth'
                            ? formatEthereumAddress(connection.address, 8)
                            : connection.platform === 'solana'
                              ? formatSolanaAddress(connection.address, 8)
                              : connection.address}
                    </span>
                    <CopyButton value={connection.address} />
                </div>
            </div>
            {noAction ? null : !connection.canReport ? (
                <DisconnectButton connection={connection} />
            ) : (
                <ReportButton connection={connection} />
            )}
        </div>
    );
}
