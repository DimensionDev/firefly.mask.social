import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Image } from '@/esm/Image.js';
import type { Token } from '@/providers/types/Transfer.js';

interface TokenIconProps {
    token: Token;
    tokenSize?: number;
    chainSize?: number;
    disableChainIcon?: boolean;
}

export function TokenIcon({ token, tokenSize = 30, chainSize = 12, disableChainIcon = false }: TokenIconProps) {
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
            {!disableChainIcon ? (
                <span
                    className="absolute -bottom-[1px] overflow-hidden rounded-full bg-lightBottom p-[1px]"
                    style={{
                        right: -chainSize / 2,
                    }}
                >
                    {token.chainLogoUrl ? (
                        <Image
                            className="rounded-full"
                            src={token.chainLogoUrl}
                            width={chainSize}
                            height={chainSize}
                            alt={token.chain}
                        />
                    ) : (
                        <ChainIcon size={chainSize} chainId={token.chainId} />
                    )}
                </span>
            ) : null}
        </span>
    );
}
