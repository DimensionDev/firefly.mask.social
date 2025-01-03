'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { FrameLayoutWithPost } from '@/components/Frame/LayoutWithPost.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidUrl } from '@/helpers/isValidUrl.js';
import { getI18n } from '@/i18n/index.js';

export default function Page() {
    const i18n = getI18n();

    const [url, setUrl] = useState('');
    const post = useMemo(() => createDummyPost(Source.Farcaster, '', url, [url]), [url]);

    const [{ error, loading }, onSubmit] = useAsyncFn(async () => {
        if (!isValidUrl(url)) throw new Error('Invalid URL');

        await fetchJSON(
            urlcat('/api/frame', {
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
                <Trans>Frame Validator</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>Please input the frame url to be revalidated.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    className="flex-1 rounded-md border border-line bg-transparent"
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t(i18n)`Your frame URL`}
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
                <FrameLayoutWithPost post={post} />
            </div>
            {error ? <div className="w-full">{error.message}</div> : null}
        </Section>
    );
}
