/* eslint-disable @next/next/no-img-element */
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { TokenType } from '@/types/rp.js';

interface CornerMarkProps {
    type: TokenType;
}

export function CornerMark({ type }: CornerMarkProps) {
    switch (type) {
        case TokenType.Fungible:
            return (
                <img
                    width={122}
                    height={122}
                    style={{ position: 'absolute', top: -1, left: -2 }}
                    src={urlcat(SITE_URL, '/rp/mark-token.png')}
                    alt="Token"
                />
            );
        case TokenType.NonFungible:
            return (
                <img
                    width={122}
                    height={122}
                    style={{ position: 'absolute', top: -1, left: -2 }}
                    src={urlcat(SITE_URL, '/rp/mark-nft.png')}
                    alt="NFT"
                />
            );
        default:
            return null;
    }
}
