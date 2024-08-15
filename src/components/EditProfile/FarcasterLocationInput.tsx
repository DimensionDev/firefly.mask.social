import { Combobox, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import { inputClassName } from '@/helpers/inputClassName.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';

export function FarcasterLocationInput() {
    const [inputValue, setInputValue] = useState('');
    const query = useDebounce(inputValue, 300);
    const { data, isLoading } = useQuery({
        queryKey: ['find-farcaster-location', query],
        queryFn() {
            return FarcasterSocialMediaProvider.findLocation(query);
        },
        enabled: !!query,
    });

    return (
        <div className="relative w-full">
            <Combobox>
                <div className="relative w-full">
                    <Combobox.Input
                        className={inputClassName()}
                        onChange={(e) => setInputValue(e.target.value)}
                        value={inputValue}
                    />
                    {isLoading ? (
                        <LoadingIcon width={24} height={24} className="absolute right-2 top-3 animate-spin" />
                    ) : null}
                </div>
                {data ? (
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        {data?.map((item) => (
                            <Combobox.Options
                                key={item.placeId}
                                className="absolute mt-1 max-h-60 w-full border-line bg-main"
                            >
                                <Combobox.Option value="test">{item.description}</Combobox.Option>
                            </Combobox.Options>
                        ))}
                    </Transition>
                ) : null}
            </Combobox>
        </div>
    );
}
