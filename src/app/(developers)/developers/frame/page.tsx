'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Frame as FrameUI } from '@/components/Frame/index.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidUrl } from '@/helpers/isValidUrl.js';

const DummyPost = createDummyPost(Source.Farcaster, '');

DummyPost.postId = '0x0000000000000000000000000000000000000000';

export default function Frame() {
    const [url, setUrl] = useState('');

    const [{ value: cacheRemoved, error, loading }, onSubmit] = useAsyncFn(async () => {
        if (!isValidUrl(url)) throw new Error(t`Invalid URL.`);

        await fetchJSON(
            urlcat('/api/frame', {
                link: url,
            }),
            {
                method: 'DELETE',
            },
        );

        return true;
    }, [url]);

    return (
        <Section>
            <Headline>
                <Trans>Frame</Trans>
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
                    placeholder={t`Your frame URL.`}
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

            {cacheRemoved === true ? (
                <div className="w-full max-w-[500px]">
                    <FrameUI urls={[url]} post={DummyPost}>
                        <></>
                    </FrameUI>
                </div>
            ) : error ? (
                <div className="w-full">{error.message}</div>
            ) : null}
        </Section>
    );
}
