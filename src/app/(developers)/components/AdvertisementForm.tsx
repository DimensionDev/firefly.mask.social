import { ImageUpload } from '@/app/(developers)/components/ImageUpload.js';
import { AdFunctionType, AdvertisementType } from '@/constants/enum.js';
import type { Advertisement } from '@/types/advertisement.js';

interface AdvertisementFormProps {
    advertisement: Advertisement;
    onChanges: (advertisement: Advertisement) => void;
}

export function AdvertisementForm({ advertisement, onChanges }: AdvertisementFormProps) {
    return (
        <form className="w-full space-y-3 text-main">
            <div className="flex flex-col">
                <label htmlFor="sort">Sort</label>
                <input
                    className="w-full rounded-md border border-line"
                    id="sort"
                    type="number"
                    value={advertisement.sort}
                    onChange={(e) => onChanges({ ...advertisement, sort: +e.target.value })}
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="image">Image</label>
                <ImageUpload
                    image={advertisement.image}
                    onChange={(url) => onChanges({ ...advertisement, image: url })}
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="link">Link</label>
                <input
                    className="w-full rounded-md border border-line"
                    id="link"
                    type="text"
                    value={advertisement.link}
                    onChange={(e) => onChanges({ ...advertisement, link: e.target.value })}
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="type">Type</label>
                <select
                    className="w-full rounded-md border border-line"
                    id="type"
                    value={advertisement.type}
                    onChange={(e) => {
                        const type = e.target.value as AdvertisementType;
                        onChanges({ ...advertisement, type });
                    }}
                >
                    <option value={AdvertisementType.Link}>Link</option>
                    <option value={AdvertisementType.Function}>Function</option>
                </select>
            </div>
            {advertisement.type === AdvertisementType.Function && (
                <div className="flex flex-col">
                    <label htmlFor="function">Function</label>
                    <input
                        className="w-full rounded-md border border-line"
                        id="function"
                        type="text"
                        value={advertisement.function}
                        onChange={(e) => onChanges({ ...advertisement, function: e.target.value as AdFunctionType })}
                    />
                </div>
            )}
        </form>
    );
}
