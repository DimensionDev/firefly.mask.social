'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CollectionPreviewer, NFTPreviewer } from '@/components/NFTs/NFTPreview.js';
import { classNames } from '@/helpers/classNames.js';
import { isValidUrl } from '@/helpers/isValidUrl.js';
import { getI18n } from '@/i18n/index.js';
import { getCollectionFromUrl } from '@/services/getCollectionFromUrl.js';
import { getNFTFromUrl } from '@/services/getNFTFromUrl.js';

export default function Page() {
    const i18n = getI18n();

    const [url, setUrl] = useState('');

    const [{ error, loading, value }, onSubmit] = useAsyncFn(async () => {
        if (!isValidUrl(url)) throw new Error('Invalid URL');

        const collection = await getCollectionFromUrl(url);

        return {
            collection,
            nft: collection ? undefined : await getNFTFromUrl(url),
        };
    }, [url]);

    return (
        <Section>
            <Headline>
                <Trans>LinkDigest Validator</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>Please input the url to be revalidated.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    value={url}
                    className="flex-1 rounded-md border border-line bg-transparent"
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t(i18n)`Your URL`}
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
                {value?.nft ? <NFTPreviewer nft={value.nft} /> : null}
                {value?.collection ? <CollectionPreviewer collection={value.collection} /> : null}
            </div>
            {error ? <div className="w-full">{error.message}</div> : null}
        </Section>
    );
}
