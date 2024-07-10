import { useSingletonModal } from '@masknet/shared-base-ui';
import { type OptionsObject, type SnackbarKey, type SnackbarMessage, useSnackbar } from 'notistack';
import { forwardRef } from 'react';

import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export type SnackbarOpenProps =
    | {
          message: SnackbarMessage;
          options?: OptionsObject;
      }
    | SnackbarMessage;

export interface SnackbarCloseProps {
    key?: SnackbarKey;
}

export const Snackbar = forwardRef<SingletonModalRefCreator<SnackbarOpenProps, SnackbarCloseProps>>(
    function Snackbar(_, ref) {
        const { enqueueSnackbar, closeSnackbar } = useSnackbar();

        useSingletonModal(ref, {
            onOpen: async (props) => {
                const withMessage = props as { message: SnackbarMessage; options?: OptionsObject };

                if ('message' in withMessage) enqueueSnackbar(withMessage.message, withMessage.options);
                else enqueueSnackbar(props as SnackbarMessage);
            },
            onClose: async (props) => {
                closeSnackbar(props.key);
            },
        });

        return null;
    },
);
