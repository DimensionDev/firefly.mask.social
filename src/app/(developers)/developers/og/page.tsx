'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Oembed } from '@/components/Oembed/index.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidUrl } from '@/helpers/isValidUrl.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';

export default function Page() {
    const { t } = useLingui();

    const [url, setUrl] = useState('');
    const post = useMemo(() => createDummyPost(Source.Farcaster, '', url, [url]), [url]);

    const [{ error, loading }, onSubmit] = useAsyncFn(async () => {
        if (!isValidUrl(url)) throw new Error('Invalid URL');

        await runInSafeAsync(async () => {
            await fetchJSON(
                urlcat('/api/og', {
                    url,
                }),
                {
                    method: 'DELETE',
                },
            );
        });

        await fetchJSON(
            urlcat('/api/oembed', {
                link: url,
            }),
            {
                method: 'DELETE',
            },
        );
    }, [url]);

    return (
        <Section>
            <Headline>
                <Trans>OpenGraph Validator</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>Please input the url to be revalidated.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    className="flex-1 rounded-md border border-line bg-transparent"
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t`Your website URL`}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <ClickableButton
                    className={classNames(
                        'flex h-[42px] w-[42px] items-center justify-center rounded-md border border-line',
                        {
                            'text-primaryMain': loading,
                            'hover:cursor-pointer': !loading,
                            'hover:text-secondary': !loading,
                        },
                    )}
                    disabled={loading || !url}
                    onClick={onSubmit}
                >
                    <ArrowPathRoundedSquareIcon width={24} height={24} />
                </ClickableButton>
            </div>

            <div className="w-full max-w-[500px]">
                <Oembed post={post} />
            </div>
            {error ? <div className="w-full">{error.message}</div> : null}
        </Section>
    );
}
