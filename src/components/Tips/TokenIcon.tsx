import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Image } from '@/esm/Image.js';
import type { Token } from '@/providers/types/Transfer.js';

interface TokenIconProps {
    token: Token;
    tokenSize?: number;
    chainSize?: number;
}

export function TokenIcon({ token, tokenSize = 30, chainSize = 12 }: TokenIconProps) {
    return (
        <span className="relative">
            {token.logo_url ? (
                <Image
                    className="rounded-full"
                    alt={token.name}
                    src={token.logo_url}
                    width={tokenSize}
                    height={tokenSize}
                />
            ) : (
                <span
                    className="block rounded-full bg-lightBg"
                    style={{
                        width: tokenSize,
                        height: tokenSize,
                    }}
                />
            )}
            <span
                className="absolute -bottom-0.5 rounded-full bg-white p-0.5"
                style={{
                    right: -chainSize / 2,
                }}
            >
                <ChainIcon size={chainSize} chainId={token.chainId} />
            </span>
        </span>
    );
}
