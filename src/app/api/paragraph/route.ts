import { parseHTML } from 'linkedom';

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
                          blog: {
                              blog: {
                                  user: {
                                      url?: string;
                                      referrerWalletAddress?: string;
                                  };
                              };
                          };
                      };
                  };
              };
          }>(dataScript.innerText)
        : undefined;

    const result = {
        ...data?.props.pageProps.collectible,
        symbol: data?.props.pageProps.initialState.blog.blog.user.url?.replace('@', '').toUpperCase(),
        referrerAddress: data?.props.pageProps.initialState.blog.blog.user.referrerWalletAddress,
    };

    return createSuccessResponseJSON(result);
}
