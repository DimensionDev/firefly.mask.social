import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { type OptionsObject, type SnackbarKey, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef } from 'react';

export interface SnackbarOpenProps {
    message: SnackbarMessage;
    options?: OptionsObject;
}

export interface SnackbarCloseProps {
    key?: SnackbarKey;
}

export const Snackbar = forwardRef<SingletonModalRefCreator<SnackbarOpenProps, SnackbarCloseProps>>(
    function Snackbar(_, ref) {
        const { enqueueSnackbar, closeSnackbar } = useSnackbar();

        useSingletonModal(ref, {
            onOpen: async (props) => {
                enqueueSnackbar(props.message, props.options);
            },
            onClose: async (props) => {
                closeSnackbar(props.key);
            },
        });

        return null;
    },
);
