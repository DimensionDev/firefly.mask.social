import { type ProviderContext, useSnackbar } from 'notistack';
import { useCallback } from 'react';

import CloseIcon from '@/assets/close.svg';

export function useCustomSnackbar(): ProviderContext['enqueueSnackbar'] {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const show: ProviderContext['enqueueSnackbar'] = useCallback(
        (message, options) => {
            const key = enqueueSnackbar(<div className="line-clamp-3">{message}</div>, {
                action: <CloseIcon width={20} height={20} onClick={() => closeSnackbar(key)} />,
                style: {
                    maxWidth: 400,
                },
                ...options,
            });
            return key;
        },
        [enqueueSnackbar, closeSnackbar],
    );
    return show;
}
