'use client';

import { t, Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { IS_PRODUCTION } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { uploadToDirectory } from '@/services/uploadToS3.js';

export default function Page() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [directory, setDirectory] = useState('');
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File>();

    const [{ loading }, handleUpload] = useAsyncFn(async () => {
        try {
            if (!file) return;
            const url = await uploadToDirectory(file, directory, () => name);
            setUrl(url);
        } catch (error) {
            enqueueErrorMessage(t`Failed to upload.`, { error });
            throw error;
        }
    }, [file, directory, name, setUrl]);

    if (IS_PRODUCTION) return null;

    return (
        <Section>
            <Headline>
                <Trans>Upload to S3</Trans>
            </Headline>
            <ClickableArea
                className="flex h-56 w-full cursor-pointer items-center justify-center rounded-xl bg-bgModal"
                onClick={() => fileInputRef.current?.click()}
            >
                {url ? (
                    <Image src={url} alt={name} width={120} height={120} className="rounded-xl object-contain" />
                ) : (
                    <span className="text-base font-bold text-secondary">
                        {file ? file.name : <Trans>Click to upload</Trans>}
                    </span>
                )}
            </ClickableArea>
            <input
                value={directory}
                onChange={(e) => setDirectory(e.target.value)}
                className="h-10 w-full rounded-xl bg-bgModal"
                placeholder={t`Directory`}
            />
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl bg-bgModal"
                placeholder={t`Name`}
            />
            <ClickableButton
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                disabled={!file || !directory || !name || loading}
                onClick={handleUpload}
            >
                {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : <Trans>Upload</Trans>}
            </ClickableButton>
            {url ? (
                <Link href={url} target="_blank" className="mt-2 text-base font-bold text-lightHighlight">
                    {url}
                </Link>
            ) : null}
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0])}
            />
        </Section>
    );
}
