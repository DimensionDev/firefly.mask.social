import { Trans } from '@lingui/macro';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { useQuery } from '@tanstack/react-query';
import { forwardRef } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { formatSolanaAddress } from '@/helpers/formatSolanaAddress.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

export const SolanaAccountModal = forwardRef<SingletonModalRefCreator>(function SolanaAccountModal(_, ref) {
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, SolanaChainId.Mainnet);
    const connectModalSolana = useConnectModalSolana();
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen() {
            useNavigatorState.getState().updateSidebarOpen(false);
        },
    });
    function onClose() {
        dispatch?.close();
    }
    const { connection } = useConnection();
    const { publicKey, wallet, disconnect } = useWallet();
    const publicKeyStr = publicKey?.toString();

    const { data: balanceLamports, isLoading: isLoadingBalanceLamports } = useQuery({
        queryKey: ['solana-balance', publicKey],
        queryFn() {
            return connection.getBalance(publicKey!);
        },
        enabled: !!publicKey && open,
    });

    return (
        <Modal open={open} onClose={onClose} disableScrollLock={false}>
            <div className="z-50 inline-flex w-[355px] flex-col items-center justify-start rounded-xl bg-primaryBottom p-6 shadow">
                <div className="flex w-full items-center justify-end">
                    <CloseButton onClick={onClose} className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-center justify-start gap-6 self-stretch">
                    <div className="flex w-full justify-center">
                        <Image
                            alt="wallet-icon"
                            src={wallet?.adapter.icon ?? ''}
                            fallback={solanaNetworkDescriptor?.icon}
                            width={67}
                            height={67}
                            className="h-[67px] w-[67px]"
                        />
                    </div>
                    <div className="flex h-[58px] flex-col items-start justify-start gap-3 self-stretch">
                        <div className="inline-flex h-6 items-center justify-center gap-1.5 self-stretch">
                            <div className="text-center text-[15px] font-bold leading-tight text-main">
                                {publicKeyStr ? formatSolanaAddress(publicKeyStr, 10) : '-'}
                            </div>
                            {publicKeyStr ? <CopyButton value={publicKeyStr} /> : null}
                        </div>
                        <div className="inline-flex h-[23px] items-center justify-start gap-3 self-stretch">
                            <div
                                className={classNames(
                                    'shrink grow basis-0 text-center text-[15px] font-bold leading-tight text-second',
                                    {
                                        'animate-pulse': isLoadingBalanceLamports,
                                    },
                                )}
                            >
                                {balanceLamports ? formatBalance(balanceLamports, 9) : '-'} SOL
                            </div>
                        </div>
                    </div>
                    <div className="inline-flex items-center justify-center gap-2 self-stretch">
                        <ClickableButton
                            onClick={() => {
                                onClose();
                                connectModalSolana.setVisible(true);
                            }}
                            className="flex h-10 shrink grow basis-0 items-center justify-center gap-1 rounded-[99px] border border-neutral-900 px-[18px] py-[11px]"
                        >
                            <div className="text-[15px] font-bold leading-tight text-main">
                                <Trans>Change Wallet</Trans>
                            </div>
                        </ClickableButton>
                        <ClickableButton
                            onClick={() => {
                                onClose();
                                disconnect();
                            }}
                            className="flex h-10 shrink grow basis-0 items-center justify-center gap-1 rounded-[99px] border border-neutral-900 px-[18px] py-[11px]"
                        >
                            <div className="text-[15px] font-bold leading-tight text-main">
                                <Trans>Disconnect</Trans>
                            </div>
                        </ClickableButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
});
