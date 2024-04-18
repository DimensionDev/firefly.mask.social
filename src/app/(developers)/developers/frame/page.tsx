'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Frame as FrameUI } from '@/components/Frame/index.js';
import { URL_REGEX } from '@/constants/regex.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export default function Frame() {
    const [url, setUrl] = useState('');

    const [{ value: cacheRemoved, error, loading }, onSubmit] = useAsyncFn(async () => {
        if (!url) throw new Error(t`URL is required.`);

        URL_REGEX.lastIndex = 0;
        if (!URL_REGEX.test(url)) throw new Error(t`Invalid URL.`);

        await fetchJSON(
            urlcat('/api/frame', {
                link: url,
            }),
            {
                method: 'DELETE',
            },
            {
                throwIfNotOK: true,
            },
        );

        return true;
    }, [url]);

    return (
        <div className="flex w-full flex-col items-center p-6">
            <Headline>
                <Trans>Frame</Trans>
            </Headline>

            <div className=" mb-2 w-full">
                <Trans>Please input the frame url to be revalidated.</Trans>
            </div>

            <div className=" mb-2 flex w-full flex-row gap-2">
                <input
                    className=" flex-1 rounded-md border border-line bg-transparent"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t`Your frame URL.`}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <ClickableButton
                    className={classNames(
                        ' flex h-[42px] w-[42px] items-center justify-center rounded-md border border-line',
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
                <div className=" w-full max-w-[500px]">
                    <FrameUI url={url} postId="" />
                </div>
            ) : error ? (
                <div className=" w-full">{error.message}</div>
            ) : null}
        </div>
    );
}
