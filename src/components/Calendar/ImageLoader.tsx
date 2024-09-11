import { useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { Image } from '@/components/Image.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

interface ImageLoaderProps {
    src: string;
}

const MASK_DARK_FALLBACK = new URL('./assets/mask.dark.svg', import.meta.url).href;
const MASK_LIGHT_FALLBACK = new URL('./assets/mask.light.svg', import.meta.url).href;

export function ImageLoader({ src }: ImageLoaderProps) {
    const isDark = useIsDarkMode();

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <div className="relative flex h-[156px] w-full items-center justify-center rounded-md bg-bg">
            {!failed ? (
                <Image
                    alt="poster"
                    src={src}
                    width={450}
                    height={150}
                    className="h-[156px] w-full rounded-md object-cover"
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setFailed(true);
                    }}
                />
            ) : (
                <Image src={isDark ? MASK_DARK_FALLBACK : MASK_LIGHT_FALLBACK} width={60} height={60} alt="mask" />
            )}
            {!loaded && !failed ? (
                <div className="absolute left-1/2 top-1/2 text-main">
                    <LoadingIcon className="animate-spin" width={20} height={20} />
                </div>
            ) : null}
        </div>
    );
}
