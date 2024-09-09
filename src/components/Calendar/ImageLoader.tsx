import { LoadingBase, makeStyles } from '@masknet/theme';
import { Box, useTheme } from '@mui/material';
import { useState } from 'react';

import { Image } from '@/components/Image.js';

interface ImageLoaderProps {
    src: string;
}

const MASK_DARK_FALLBACK = new URL('../assets/mask.dark.svg', import.meta.url).href;
const MASK_LIGHT_FALLBACK = new URL('../assets/mask.light.svg', import.meta.url).href;

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        height: '156px',
        display: 'flex',
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        position: 'relative',
    },
    poster: {
        borderRadius: '8px',
        width: '100%',
        height: '156px',
        objectFit: 'cover',
    },
    iconContainer: {
        position: 'absolute',
        top: 'calc(50% - 10px)',
        left: 'calc(50% - 10px)',
        color: theme.palette.maskColor.main,
    },
}));

export function ImageLoader({ src }: ImageLoaderProps) {
    const { classes } = useStyles();
    const theme = useTheme();

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <div className={classes.container}>
            {!failed ? (
                <Image
                    alt="poster"
                    src={src}
                    width={60}
                    height={60}
                    className={classes.poster}
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setFailed(true);
                    }}
                />
            ) : (
                <Image
                    src={theme.palette.mode === 'light' ? MASK_LIGHT_FALLBACK : MASK_DARK_FALLBACK}
                    width={60}
                    height={60}
                    alt="mask"
                />
            )}
            {!loaded && !failed ? (
                <Box className={classes.iconContainer}>
                    <LoadingBase size={20} />
                </Box>
            ) : null}
        </div>
    );
}
