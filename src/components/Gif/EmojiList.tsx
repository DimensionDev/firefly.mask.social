import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';

import { LoadingIndicator } from '@/components/Gif/LoadingIndicator.js';
import { env } from '@/constants/env.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { IGif } from '@/types/giphy.js';

const giphyApi = new GiphyFetch(env.external.NEXT_PUBLIC_GIPHY_API_KEY);

const fetchDefaultVariations = (offset: number) => giphyApi.emojiDefaultVariations({ offset });

interface EmojiListProps {
    width: number;
    onSelected: (gif: IGif) => void;
}

export const EmojiList = memo<EmojiListProps>(function EmojiList({ width, onSelected }) {
    const isMedium = useIsMedium();

    const [{ loading }, fetchGifs] = useAsyncFn(async (offset: number) => {
        return await fetchDefaultVariations(offset);
    }, []);

    return (
        <div className="relative h-full rounded">
            <div className="no-scrollbar h-full overflow-y-auto overflow-x-hidden px-3">
                <Grid
                    className="ff-giphy-grid"
                    hideAttribution
                    noLink
                    columns={isMedium ? 3 : 2}
                    width={width}
                    fetchGifs={fetchGifs}
                    onGifClick={onSelected}
                />
            </div>
            {loading ? <LoadingIndicator /> : null}
        </div>
    );
});
