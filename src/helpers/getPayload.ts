import { parseJSON } from '@masknet/web3-providers/helpers';

import { type MirrorPayload, OpenGraphPayloadSourceType } from '@/types/openGraph.js';

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

    return {
        type: OpenGraphPayloadSourceType.Mirror,
        address,
        timestamp,
        ens,
        displayName,
    };
}
