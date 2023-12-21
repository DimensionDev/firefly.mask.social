import { parseJSON } from '@masknet/web3-providers/helpers';

import type { Cast } from '@/providers/types/Warpcast.js';
import { type FarcasterPayload, type MirrorPayload, OpenGraphPayloadSourceType } from '@/types/og.js';

export function getMirrorPayload(document: Document): MirrorPayload | null {
    const dataScript = document.getElementById('__NEXT_DATA__');
    const data = dataScript?.innerText
        ? parseJSON<{
              props: {
                  pageProps: {
                      __APOLLO_STATE__: Record<
                          string,
                          {
                              publishedAtTimestamp: number;
                              body: string;
                          }
                      >;
                      digest: string;
                      publicationLayoutProject: {
                          address: `0x${string}`;
                          ens: string;
                          displayName: string;
                      };
                  };
              };
          }>(dataScript.innerText)
        : undefined;
    if (!data) return null;

    const address = data?.props?.pageProps?.publicationLayoutProject?.address;
    const digest = data?.props?.pageProps?.digest;
    const entry = data?.props?.pageProps?.__APOLLO_STATE__?.[`entry:${digest}`];
    const timestamp = entry?.publishedAtTimestamp ? entry.publishedAtTimestamp * 1000 : undefined;
    const ens = data?.props?.pageProps?.publicationLayoutProject?.ens;
    const displayName = data?.props?.pageProps?.publicationLayoutProject?.displayName;
    const body = entry?.body;
    return {
        type: OpenGraphPayloadSourceType.Mirror,
        address,
        timestamp,
        ens,
        displayName,
        body,
    };
}

export function getFarcasterPayload(document: Document): FarcasterPayload | null {
    const dataScript = document.getElementById('__NEXT_DATA__');
    const data = dataScript?.innerText
        ? parseJSON<{
              props: {
                  pageProps: {
                      focusedCast: Cast;
                  };
              };
              query: {
                  castHashPrefix?: string;
                  castHash?: string;
              };
          }>(dataScript.innerText)
        : undefined;
    const query = data?.query?.castHashPrefix ?? data?.query?.castHash;
    if (!query) return null;

    const cast = data?.props?.pageProps?.focusedCast;
    if (!cast) return null;
    return {
        type: OpenGraphPayloadSourceType.Farcaster,
        cast,
    };
}
