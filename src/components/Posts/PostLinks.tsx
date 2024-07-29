'use client';

import { useQuery } from '@tanstack/react-query';
import { isUndefined, last } from 'lodash-es';
import { useEffect } from 'react';
import urlcat from 'urlcat';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { FrameLayout } from '@/components/Frame/index.js';
import { OembedUIAndPayload } from '@/components/Oembed/index.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { attemptUntil } from '@/helpers/attemptUntil.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { removeAtEnd } from '@/helpers/removeAtEnd.js';
import { resolveBlinkTCO } from '@/helpers/resolveBlinkTCO.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested } from '@/types/og.js';

interface Props {
    post: Pick<Post, 'postId' | 'metadata' | 'quoteOn' | 'source'>;
    setContent?: (content: string) => void;
}

export function PostLinks({ post, setContent }: Props) {
    const url = post.metadata.content?.oembedUrl;
    const urls = post.metadata.content?.oembedUrls ?? [];
    const content = post.metadata.content?.content;

    // a blink could be a normal url, so the result is also available for the oembed and frame components
    const schemes =
        env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled && content ? BlinkParser.extractSchemes(content) : [];
    const scheme = last(schemes);

    const { isLoading, error, data } = useQuery({
        queryKey: ['post-embed', url, urls, scheme],
        queryFn: async () => {
            // parallel request
            const blinkPromise = scheme
                ? (async () => BlinkLoader.fetchAction(await resolveBlinkTCO(scheme)).catch(() => null))()
                : null;
            const framePromise =
                env.external.NEXT_PUBLIC_FRAME === STATUS.Enabled && urls.length > 0
                    ? attemptUntil(
                          urls.map((x) => async () => {
                              if (isValidDomain(x)) return;
                              return fetchJSON<ResponseJSON<LinkDigestedResponse>>(
                                  urlcat('/api/frame', {
                                      link: (await resolveTCOLink(x)) ?? x,
                                  }),
                              );
                          }),
                          undefined,
                          (response) => {
                              if (isUndefined(response)) return true;
                              return !response?.success;
                          },
                      )
                          .then((res) => {
                              if (!res?.success) return null;
                              return res.data.frame;
                          })
                          .catch(() => null)
                    : null;
            const [blink, frame] = await Promise.all([blinkPromise, framePromise]);

            if (blink || frame) {
                return { frame, blink };
            }

            if (!url || isValidDomain(url) || post.quoteOn) return;
            const linkDigested = await fetchJSON<ResponseJSON<LinkDigested>>(
                urlcat('/api/oembed', {
                    link: (await resolveTCOLink(url)) ?? url,
                }),
            );
            if (!linkDigested.success) return;
            return { oembed: linkDigested.data };
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (data?.oembed && url && content) {
            setContent?.(removeAtEnd(content, url));
        }
    }, [content, data?.oembed, setContent, url]);

    if (isLoading || error || !data) return null;

    return (
        <>
            {data.frame ? <FrameLayout frame={data.frame} post={post} /> : null}
            {data.blink ? <ActionContainer action={data.blink} /> : null}
            {!data.blink && !data.frame && data.oembed ? (
                <OembedUIAndPayload data={data.oembed} postId={post.postId} />
            ) : null}
        </>
    );
}
