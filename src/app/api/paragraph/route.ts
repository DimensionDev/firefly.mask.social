import { parseHTML } from 'linkedom';
import { first, isEmpty } from 'lodash-es';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { parseJSON } from '@/helpers/parseJSON.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: 400 });

    const response = await fetch(link, {
        headers: { 'User-Agent': 'Twitterbot' },
        signal: request.signal,
    });

    if (!response.ok || (response.status >= 500 && response.status < 600)) {
        return Response.json({ error: 'Unable to digest link' }, { status: 500 });
    }

    const html = await response.text();

    const { document } = parseHTML(html);

    const dataScript = document.getElementById('__NEXT_DATA__');
    const data = dataScript?.innerText
        ? parseJSON<{
              props: {
                  pageProps: {
                      collectible: {
                          chain: string;
                          noteId: string;
                          supply: string;
                          costEth: string;
                          position: {
                              from: number;
                              to: number;
                          };
                          contractAddress: string;
                          text: string;
                          collectorWallet: string;
                      };

                      initialState: {
                          notes: {
                              allNotes: Array<{
                                  highlightsSupply: string;
                                  highlightsCost: number;
                                  highlightsChain: string;
                                  id: string;
                                  post_preview: string;
                                  collectibleWalletAddress: string;
                              }>;
                          };
                          blog: {
                              blog: {
                                  url?: string;
                                  user: {
                                      referrerWalletAddress?: string;
                                  };
                              };
                          };
                      };
                  };
              };
          }>(dataScript.innerText)
        : undefined;

    if (isEmpty(data?.props.pageProps.collectible)) {
        const target = first(data?.props.pageProps.initialState.notes.allNotes);
        if (!target) return Response.json({ error: 'Unable to digest link' }, { status: 500 });

        const result = {
            chain: target.highlightsChain,
            noteId: target.id,
            supply: target.highlightsSupply,
            costEth: target.highlightsCost,
            text: target.post_preview,
            collectorWallet: target.collectibleWalletAddress,
            position: {
                from: 0,
                to: 0,
            },
            symbol: data?.props.pageProps.initialState.blog.blog.url?.replace('@', '').toUpperCase(),
            referrerAddress: data?.props.pageProps.initialState.blog.blog.user.referrerWalletAddress,
        };

        return createSuccessResponseJSON(result);
    }

    const result = {
        ...data?.props.pageProps.collectible,
        symbol: data?.props.pageProps.initialState.blog.blog.url?.replace('@', '').toUpperCase(),
        referrerAddress: data?.props.pageProps.initialState.blog.blog.user.referrerWalletAddress,
    };

    return createSuccessResponseJSON(result);
}
