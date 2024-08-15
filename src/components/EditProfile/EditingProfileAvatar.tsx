import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Avatar } from '@/components/Avatar.js';
import { getFileURL } from '@/helpers/getFileURL.js';

export function EditingProfileAvatar({ pfp, name }: { pfp: string; name: string }) {
    const { control } = useFormContext();
    const value = useWatch({ control, name }) as FileList;
    const data = useMemo(() => (value && value[0] ? getFileURL(value[0]) : null), [value]);
    return <Avatar src={data || pfp} size={108} alt="avatar" />;
}
