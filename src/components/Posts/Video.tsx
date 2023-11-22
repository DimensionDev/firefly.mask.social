import 'plyr-react/plyr.css';

import { Player } from '@livepeer/react';
import { memo } from 'react';
import { useAccount } from 'wagmi';

import { ARWEAVE_GATEWAY, IPFS_GATEWAY } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';

interface VideoProps {
    src: string;
    poster?: string;
    className?: string;
}

export const Video = memo<VideoProps>(function Video({ src, poster, className = '' }) {
    const account = useAccount();

    return (
        <div
            className={classNames('lp-player', className)}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <Player
                src={src}
                poster={formatImageUrl(sanitizeDStorageUrl(poster))}
                objectFit="contain"
                showLoadingSpinner
                showUploadingIndicator
                showPipButton={false}
                viewerId={account.address}
                controls={{ defaultVolume: 1 }}
                refetchPlaybackInfoInterval={1000 * 60 * 60 * 24}
                autoUrlUpload={{
                    fallback: true,
                    ipfsGateway: IPFS_GATEWAY,
                    arweaveGateway: ARWEAVE_GATEWAY,
                }}
            />
        </div>
    );
});
