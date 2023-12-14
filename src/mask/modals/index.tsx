import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base';
import { memo } from 'react';

import { ConfirmDialogComponent } from '@/maskbook/packages/shared/src/index.js';
import { ConfirmModal } from '@/maskbook/packages/shared/src/UI/modals/ConfirmModal/index.js';
import { GasSettingModal } from '@/maskbook/packages/shared/src/UI/modals/GasSettingModal/index.js';
import { LeavePageConfirmModal } from '@/maskbook/packages/shared/src/UI/modals/LeavePageConfirmModal/index.js';
import * as controls from '@/maskbook/packages/shared/src/UI/modals/modals.js';
import { SelectGasSettingsModal } from '@/maskbook/packages/shared/src/UI/modals/SelectAdvancedSettingsDialog/index.js';
import { SelectFungibleTokenModal } from '@/maskbook/packages/shared/src/UI/modals/SelectFungibleTokenModal/index.js';
import { SelectNonFungibleContractModal } from '@/maskbook/packages/shared/src/UI/modals/SelectNonFungibleContractModal/index.js';
import { TransactionConfirmModal } from '@/maskbook/packages/shared/src/UI/modals/TokenTransactionConfirmModal/index.js';
import { TransactionSnackbarModal } from '@/maskbook/packages/shared/src/UI/modals/TransactionSnackbar/index.js';
import { WalletRiskWarningModal } from '@/maskbook/packages/shared/src/UI/modals/WalletRiskWarningModal/index.js';
import { NetworkPluginID } from '@/maskbook/packages/shared-base/src/index.js';

export interface ModalProps {}

export const Modals = memo(function Modals(props: ModalProps) {
    return (
        <RootWeb3ContextProvider>
            <ConfirmDialogComponent ref={controls.ConfirmDialog.register} />
            <WalletRiskWarningModal ref={controls.WalletRiskWarningModal.register} />
            <LeavePageConfirmModal ref={controls.LeavePageConfirmModal.register} />
            <GasSettingModal ref={controls.GasSettingModal.register} />
            <TransactionSnackbarModal
                pluginID={NetworkPluginID.PLUGIN_EVM}
                ref={controls.TransactionSnackbar.register}
            />
            <TransactionConfirmModal ref={controls.TransactionConfirmModal.register} />
            <ConfirmModal ref={controls.ConfirmModal.register} />
            <SelectNonFungibleContractModal ref={controls.SelectNonFungibleContractModal.register} />
            <SelectFungibleTokenModal ref={controls.SelectFungibleTokenModal.register} />
            <SelectGasSettingsModal ref={controls.SelectGasSettingsModal.register} />
        </RootWeb3ContextProvider>
    );
});
