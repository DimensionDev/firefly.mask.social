import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Avatar } from '@/components/Avatar.js';
import { getFileURL } from '@/helpers/getFileURL.js';

export function EditProfileAvatar({ pfp, name }: { pfp: string; name: string }) {
    const { control } = useFormContext();
    const value = useWatch({ control, name }) as File;
    const data = useMemo(() => (value ? getFileURL(value) : null), [value]);
    return <Avatar src={data || pfp} size={108} alt="avatar" />;
}
