'use client';

import { t, Trans } from '@lingui/macro';
import { useMemo, useState } from 'react';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { Blink } from '@/components/Blink/index.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';

export default function BlinkPage() {
    const [url, setUrl] = useState('');
    const post = useMemo(() => createDummyPost(Source.Farcaster, url, url, [url]), [url]);

    return (
        <Section>
            <Headline>
                <Trans>Blink</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>
                    Please input the blink url to be revalidated.{' '}
                    <Link
                        href="https://docs.dialect.to/documentation/actions/actions/url-scheme"
                        className="text-farcasterPrimary underline"
                        target="_blank"
                    >
                        URL Scheme
                    </Link>
                </Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    className="flex-1 rounded-md border border-line bg-transparent"
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t`Your Blink URL.`}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>

            <div className="w-full max-w-[500px]">
                <Blink post={post} />
            </div>
        </Section>
    );
}
