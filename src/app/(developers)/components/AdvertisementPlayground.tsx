import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import type { Swiper } from 'swiper/types';

import { AdvertisementForm } from '@/app/(developers)/components/AdvertisementForm.js';
import {
    clearS3Cache,
    jsonToFile,
    validateAdvertisement,
} from '@/app/(developers)/developers/advertisement/helpers.js';
import LoadingIcon from '@/assets/loading.svg';
import { AdvertisementSwiper } from '@/components/Advertisement/AdvertisementSwiper.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { AdFunctionType, AdvertisementType, NODE_ENV } from '@/constants/enum.js';
import { ADVERTISEMENT_JSON_URL, ADVERTISEMENT_JSON_URL_DEV } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { uploadToDirectory } from '@/services/uploadToS3.js';
import type { Advertisement } from '@/types/advertisement.js';

const configs = [
    {
        id: NODE_ENV.Development,
        title: 'Development',
        url: ADVERTISEMENT_JSON_URL_DEV,
        name: 'web-dev.json',
    },
    {
        id: NODE_ENV.Production,
        title: 'Production',
        url: ADVERTISEMENT_JSON_URL,
        name: 'web.json',
    },
];

export function AdvertisementPlayground() {
    const [index, setIndex] = useState(0);
    const [draft, setDraft] = useState<Advertisement[]>([]);
    const [currentConfigId, setCurrentConfigId] = useState(configs[0].id);

    const configUrl = configs.find((config) => config.id === currentConfigId)?.url;
    const {
        data = [],
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['advertisement', configUrl],
        staleTime: 0,
        queryFn: async () => {
            if (!configUrl) return [];

            const res = await fetchJSON<{ advertisements: Advertisement[] }>(configUrl);
            const currentData = (res?.advertisements ?? []).sort((a, b) => a.sort - b.sort);
            setDraft(currentData);
            return currentData;
        },
    });

    const invalidIndex = useMemo(() => {
        const index = draft.findIndex((ad) => !validateAdvertisement(ad));

        return index < 0 ? undefined : index;
    }, [draft]);

    const onSlideChange = useCallback(
        (swiper: Swiper) => {
            setIndex(swiper.realIndex);
        },
        [setIndex],
    );

    const onAdvertisementChange = useCallback(
        (advertisement: Advertisement) => {
            setDraft((prev) => {
                const next = [...prev];
                next[index] = advertisement;
                return next;
            });
        },
        [index],
    );

    const [{ loading: uploading }, uploadConfig] = useAsyncFn(
        async function () {
            try {
                const config = configs.find((config) => config.id === currentConfigId);
                if (!config) throw new Error('Invalid config');

                const jsonFile = await jsonToFile(draft, config.name);
                await uploadToDirectory(jsonFile, 'advertisement', () => config.name);
                await clearS3Cache(`/advertisement/${config.name}`);

                enqueueSuccessMessage(t`Successfully uploaded advertisement`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to upload advertisement`), { error });
                throw error;
            }
        },
        [currentConfigId, draft],
    );

    const handleRemove = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`Remove Advertisement`,
            variant: 'normal',
            content: t`Are you sure you want to remove this advertisement?`,
        });
        if (!confirmed) return;
        setDraft((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const handleAdd = () => {
        setDraft((prev) => {
            const next = [...prev];
            next.splice(index + 1, 0, {
                sort: 0,
                image: '',
                link: '/',
                type: AdvertisementType.Link,
                function: '' as AdFunctionType,
            });
            return next;
        });
    };

    const hasChanged = !isEqual(data, draft);
    const loading = isLoading || isRefetching;

    return (
        <div className="flex flex-col items-center">
            <div className="min-h-[133px] max-w-[352px]">
                {loading ? (
                    <div className="min-h-[133px] animate-pulse rounded-xl bg-bg" />
                ) : draft?.length ? (
                    <AdvertisementSwiper autoplay={false} onSlideChange={onSlideChange} data={draft} />
                ) : (
                    <div className="flex min-h-[133px] items-center justify-center rounded-xl bg-bg">
                        No advertisement data found
                    </div>
                )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-x-1">
                {configs.map((config) => (
                    <ClickableButton
                        key={config.id}
                        className="contents cursor-pointer"
                        onClick={() => {
                            if (loading || currentConfigId === config.id) return;
                            setDraft([]);
                            setCurrentConfigId(config.id);
                        }}
                    >
                        {config.title}
                        <CircleCheckboxIcon className="mr-5" checked={currentConfigId === config.id} />
                    </ClickableButton>
                ))}
            </div>
            {loading ? null : (
                <>
                    {draft[index] ? (
                        <AdvertisementForm onChanges={onAdvertisementChange} advertisement={draft[index]} />
                    ) : null}
                    <div className="mt-4 flex w-full gap-x-2">
                        {draft[index] ? (
                            <ClickableButton
                                disabled={uploading}
                                onClick={handleRemove}
                                className="flex-1 rounded-md bg-danger p-2 text-primaryBottom"
                            >
                                Remove
                            </ClickableButton>
                        ) : null}
                        <ClickableButton
                            disabled={uploading}
                            onClick={handleAdd}
                            className="flex-1 rounded-md bg-main p-2 text-primaryBottom"
                        >
                            New one
                        </ClickableButton>
                    </div>
                    <ClickableButton
                        disabled={!hasChanged || invalidIndex !== undefined || uploading}
                        className="mt-2 w-full rounded-md bg-main p-2 text-primaryBottom"
                        onClick={uploadConfig}
                    >
                        {uploading ? (
                            <LoadingIcon className="inline-block animate-spin" width={20} height={20} />
                        ) : invalidIndex !== undefined ? (
                            `Invalid advertisement at index ${invalidIndex}`
                        ) : (
                            'Confirm Changes'
                        )}
                    </ClickableButton>
                </>
            )}
        </div>
    );
}
