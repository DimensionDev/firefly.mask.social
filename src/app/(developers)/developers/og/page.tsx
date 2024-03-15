'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Oembed } from '@/components/Oembed/index.js';
import { URL_REGEX } from '@/constants/regex.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export default function OpenGraph() {
    const [url, setUrl] = useState('');

    const [{ value: cacheRemoved, error, loading }, onSubmit] = useAsyncFn(async () => {
        if (!url) throw new Error(t`URL is required.`);

        URL_REGEX.lastIndex = 0;
        if (!URL_REGEX.test(url)) throw new Error(t`Invalid URL.`);

        await fetchJSON(
            urlcat('/api/oembed', {
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
            <div className="w-full gap-6 pb-6 text-[20px] font-bold leading-[24px] text-main">
                <Trans>OpenGraph</Trans>
            </div>

            <div className="mb-2 w-full">
                <Trans>Please input the url to be revalidated.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    className="flex-1 rounded-md border border-line bg-transparent"
                    placeholder={t`Your website URL.`}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
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
                </button>
            </div>

            {cacheRemoved === true ? (
                <div className="w-full max-w-[500px]">
                    <Oembed url={url} />
                </div>
            ) : error ? (
                <div className="w-full">{error.message}</div>
            ) : null}
        </div>
    );
}
