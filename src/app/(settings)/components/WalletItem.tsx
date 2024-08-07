import { DisconnectButton } from '@/app/(settings)/components/DisconnectButton.js';
import { ReportButton } from '@/app/(settings)/components/ReportButton.js';
import WalletIcon from '@/assets/wallet-circle.svg';
import VerifiedWalletIcon from '@/assets/wallet-circle-verified.svg';
import { CopyButton } from '@/components/CopyButton.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import type { FireflyProfile, WalletProfile } from '@/providers/types/Firefly.js';

interface WalletItemProps {
    profile: FireflyProfile;
    relations: FireflyProfile[];
    noAction?: boolean;
}

export function WalletItem({ profile, relations, noAction = false }: WalletItemProps) {
    if (profile.source !== Source.Wallet) return null;

    const walletProfile = profile.__origin__ as WalletProfile;

    return (
        <div
            className="mb-3 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 text-[15px] text-lightMain dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            {walletProfile.is_connected ? (
                <VerifiedWalletIcon width={24} height={24} />
            ) : (
                <WalletIcon width={24} height={24} />
            )}
            <div className="flex flex-1 flex-col text-left">
                {walletProfile.primary_ens ? (
                    <span className="text-base font-bold">{walletProfile.primary_ens}</span>
                ) : null}
                <div
                    className={classNames(
                        'flex items-center',
                        walletProfile.primary_ens ? 'text-lightSecond' : 'font-semibold text-lightMain',
                    )}
                >
                    <span>{formatEthereumAddress(walletProfile.address, 8)}</span>
                    <CopyButton value={walletProfile.address} />
                </div>
            </div>
            {noAction ? null : walletProfile.is_connected ? (
                <DisconnectButton profile={profile} relations={relations} />
            ) : (
                <ReportButton profile={profile} />
            )}
        </div>
    );
}
