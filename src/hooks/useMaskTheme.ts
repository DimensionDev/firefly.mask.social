import { MaskColors, MaskDarkTheme, MaskLightTheme } from '@masknet/theme';
import type { Theme } from '@mui/material/styles';
import { merge } from 'lodash-es';
import { useMemo } from 'react';

import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

function createTheme(theme: Theme) {
    return merge(theme, {
        components: {
            MuiTypography: {
                styleOverrides: {
                    root: {
                        fontFamily:
                            /* cspell:disable-next-line */
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    },
                },
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        backgroundColor: MaskColors[theme.palette.mode].maskColor.bottom,
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                    },
                },
            },
            MuiBackdrop: {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.action.mask,
                    },
                    invisible: {
                        opacity: '0 !important',
                    },
                },
            },
        },
    });
}

export function useMaskTheme(): Theme {
    const isDarkMode = useIsDarkMode();

    return useMemo(() => createTheme(isDarkMode ? MaskDarkTheme : MaskLightTheme), [isDarkMode]);
}
